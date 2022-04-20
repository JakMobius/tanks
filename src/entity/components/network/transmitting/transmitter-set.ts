import {Transmitter} from "./transmitter";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import {ReceivingEnd} from "./receiving-end";

export class TransmitterSet {
    private treeDepth: number = null
    transmitters = new Set<Transmitter>()
    transmitComponent: EntityDataTransmitComponent | null = null
    receivingEnd: ReceivingEnd

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
        this.treeDepth = 0
        let entity = this.transmitComponent.entity
        while(entity != this.receivingEnd.getRoot()) {
            entity = entity.parent
            this.treeDepth++
        }

        if(entity == this.receivingEnd.getRoot()) return
        this.treeDepth = NaN
    }

    invalidateNodeDepth() {
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
}