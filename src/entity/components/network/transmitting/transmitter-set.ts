import {Transmitter} from "./transmitter";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import {ReceivingEnd} from "./receiving-end";

export class TransmitterSet {
    private treeDepth: number | null = null
    transmitters = new Set<Transmitter>()
    transmitComponent: EntityDataTransmitComponent | null = null
    receivingEnd: ReceivingEnd
    private attached = false

    constructor(end: ReceivingEnd) {
        this.receivingEnd = end
    }

    attachTransmitter(transmitter: Transmitter) {
        transmitter.attachToSet(this)
        this.transmitters.add(transmitter)
    }

    detachTransmitters() {
        for (let transmitter of this.transmitters) {
            transmitter.detachFromSet()
        }
        this.transmitters.clear()
        this.detachIfEmpty()
    }

    detachTransmitter(transmitter: Transmitter) {
        if (!this.transmitters.has(transmitter)) return;

        transmitter.detachFromSet()
        this.transmitters.delete(transmitter)
        this.detachIfEmpty()
    }

    isEmpty() {
        return !this.transmitters.size
    }

    private calculateNodeDepth() {
        if(!this.transmitComponent) {
            this.treeDepth = null
            return
        }
        // TODO: can be optimised by using parent node depths
        this.treeDepth = 0
        let entity = this.transmitComponent.entity
        while(entity != this.receivingEnd.getRoot()) {
            entity = entity.parent
            this.treeDepth++
        }

        if(entity == this.receivingEnd.getRoot()) return
        this.treeDepth = null
    }

    detachIfEmpty() {
        if(this.isEmpty()) {
            this.transmitComponent.removeTransmitterSet(this.receivingEnd)
        }
    }

    getNodeDepth() {
        if(this.treeDepth === null) {
            this.calculateNodeDepth()
        }
        return this.treeDepth
    }

    handleTreeChange() {
        this.calculateNodeDepth()
        this.updateAttachState()
    }

    private updateAttachState() {
        let newAttachState = Number.isInteger(this.treeDepth)
        if(newAttachState == this.attached) return
        this.attached = newAttachState

        if(this.attached) this.attachedToRoot()
        else this.detachedFromRoot()
    }

    private attachedToRoot() {
        for(let transmitter of this.transmitters.values()) {
            transmitter.attachedToRoot()
        }
    }

    private detachedFromRoot() {
        for(let transmitter of this.transmitters.values()) {
            transmitter.detachedFromRoot()
        }
    }

    setTransmitComponent(component: EntityDataTransmitComponent) {
        this.transmitComponent = component
        this.handleTreeChange()
    }

    isAttachedToRoot() {
        return this.attached;
    }
}