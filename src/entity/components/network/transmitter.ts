
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import {TransmitContext, TransmitterSet} from "./entity-data-transmit-component";

export class Transmitter {
    set: TransmitterSet | null = null
    eventHandler = new BasicEventHandlerSet()
    queue: Array<(context: TransmitContext) => void> = []

    constructor() {

    }

    onPack(context: TransmitContext) {
        for(let action of this.queue) action(context)
        this.queue = []
    }

    performOnPack(callback: (context: TransmitContext) => void) {
        this.set.transmitComponent.setHasData(this.set.receivingEnd)
        this.queue.push(callback)
    }

    attachToSet(set: TransmitterSet): void {
        this.set = set
        this.eventHandler.setTarget(set.transmitComponent.entity)
    }

    detachFromSet() {
        this.queue = []
        this.set = null
        this.eventHandler.setTarget(null)
    }

    getEntity() {
        return this.set.transmitComponent.entity
    }
}