import WriteBuffer from "src/serialization/binary/write-buffer";
import Entity from "src/utils/ecs/entity";
import {TransmitterSet} from "./transmitter-set";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import BinaryBlockCoder from "src/serialization/binary/parsers/binary-block-coder";
import EventEmitter from "src/utils/event-emitter";

export class ReceivingEnd extends EventEmitter {
    buffer = new WriteBuffer()
    root: Entity
    currentNode: Entity

    hasData() {
        return this.buffer.offset > 0
    }

    reset() {
        this.buffer.reset()
        this.currentNode = this.root
        this.buffer.writeInt32(-1)
    }

    setRoot(root: Entity) {
        this.root = root
        this.reset()
    }

    spitBuffer() {
        // Finish the block
        // TODO: Maybe it can be wrapped in a function or something
        let endPosition = this.buffer.offset
        this.buffer.offset = 0
        this.buffer.writeUint32(endPosition)
        this.buffer.offset = endPosition

        let buffer = this.buffer.spitBuffer()
        this.reset()
        return buffer
    }

    private encodeNavigation(source: TransmitterSet, transmitterSet: TransmitterSet) {
        let sourceEntity = source.transmitComponent.entity
        let sourceDepth = source.getNodeDepth()

        const targetEntity = transmitterSet.transmitComponent.entity
        const targetDepth = transmitterSet.getNodeDepth()

        // Prevent nasty bugs
        if(sourceDepth === null || targetDepth === null) {
            throw new Error("Illegal navigation")
        }

        // Finding the nearest common parent

        let ascendLength = 0

        while(sourceDepth > targetDepth) {
            ascendLength++
            sourceDepth--
            sourceEntity = sourceEntity.parent
        }

        let middleEntity = targetEntity
        let middleDepth = targetDepth

        let descentPath = []

        while(sourceDepth < middleDepth) {
            middleDepth--
            descentPath.push(middleEntity)
            middleEntity = middleEntity.parent
        }

        while(middleEntity != sourceEntity) {
            ascendLength++
            descentPath.push(middleEntity)
            if(!sourceEntity || !middleEntity) {
                throw new Error("Provided entities does not have any common parents")
            }
            middleEntity = middleEntity.parent
            sourceEntity = sourceEntity.parent
        }

        this.buffer.writeUint16(ascendLength)
        this.buffer.writeUint16(descentPath.length)
        for(let i = descentPath.length - 1; i >= 0; i--) {
            let waypoint = descentPath[i]
            let component = waypoint.getComponent(EntityDataTransmitComponent)
            this.buffer.writeUint32(component.networkIdentifier)
        }
    }

    packNavigationPath(target: TransmitterSet) {
        let entityComponent = this.currentNode.getComponent(EntityDataTransmitComponent)
        let currentTransmitterSet = entityComponent.transmitterSetFor(this)
        this.encodeNavigation(currentTransmitterSet, target)
    }

    packCommand(transmitterSet: TransmitterSet, command: number, callback: (buffer: WriteBuffer) => void) {
        this.packNavigationPath(transmitterSet)

        this.currentNode = transmitterSet.transmitComponent.entity

        BinaryBlockCoder.encodeBlock(this.buffer, () => {
            this.buffer.writeUint16(command)
            callback(this.buffer)
        });
    }

    detachSubtree(subtree: EntityDataTransmitComponent = null) {
        if(!subtree) {
            if(!this.root) return
            subtree = this.root.getComponent(EntityDataTransmitComponent)
        }

        // Detach children first
        for(let [, child] of subtree.childTransmitComponents.entries()) {
            this.detachSubtree(child)
        }

        let transmitterSet = subtree.transmitterSetFor(this)
        if(transmitterSet) {
            transmitterSet.detachTransmitters()
        }
    }
}