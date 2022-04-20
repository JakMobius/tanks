import WriteBuffer from "../../../../serialization/binary/write-buffer";
import Entity from "../../../../utils/ecs/entity";
import {TransmitterSet} from "./transmitter-set";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import BinaryBlockCoder from "../../../../serialization/binary/parsers/binary-block-coder";

export class ReceivingEnd {
    private buffer = new WriteBuffer()
    private currentNode: Entity
    private currentDepth = 0
    private root: Entity

    hasData() {
        return this.buffer.offset > 0
    }

    reset() {
        this.buffer.reset()
        this.currentDepth = 0
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

    getRoot() {
        return this.root
    }

    private navigateTo(transmitterSet: TransmitterSet) {
        const savedEntity = this.currentNode
        const savedDepth = this.currentDepth

        const targetEntity = transmitterSet.transmitComponent.entity
        const targetDepth = transmitterSet.getNodeDepth()

        // Finding the nearest common parent

        let ascendLength = 0

        while(this.currentDepth > targetDepth) {
            ascendLength++
            this.currentDepth--
            this.currentNode = this.currentNode.parent
        }

        let middleEntity = targetEntity
        let middleDepth = targetDepth

        let descentPath = []

        while(this.currentDepth < middleDepth) {
            middleDepth--
            descentPath.push(middleEntity)
            middleEntity = middleEntity.parent
        }

        while(middleEntity != this.currentNode) {
            ascendLength++
            descentPath.push(middleEntity)
            if(!this.currentNode || !middleEntity) {
                this.currentNode = savedEntity
                this.currentDepth = savedDepth
                throw new Error("Provided entities does not have any common parents")
            }
            middleEntity = middleEntity.parent
            this.currentNode = this.currentNode.parent
        }

        this.currentNode = targetEntity
        this.currentDepth = targetDepth

        this.buffer.writeUint16(ascendLength)
        this.buffer.writeUint16(descentPath.length)
        for(let i = descentPath.length - 1; i >= 0; i--) {
            let waypoint = descentPath[i]
            let component = waypoint.getComponent(EntityDataTransmitComponent)
            this.buffer.writeUint32(component.networkIdentifier)
        }
    }

    packCommand(transmitterSet: TransmitterSet, command: number, callback: (buffer: WriteBuffer) => void) {
        this.navigateTo(transmitterSet)
        BinaryBlockCoder.encodeBlock(this.buffer, () => {
            this.buffer.writeUint16(command)
            callback(this.buffer)
        });
    }
}