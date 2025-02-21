import {TransmitterSet} from "./transmitter-set";
import {ReceivingEnd} from "./receiving-end";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class EntityDataTransmitComponent extends EventHandlerComponent {
    transmitterSets = new Map<ReceivingEnd, TransmitterSet>()
    visibleAnywhere: boolean = false
    ends = new Set<ReceivingEnd>()

    constructor() {
        super();

        this.eventHandler.on("detached-from-parent", () => {
            this.updateParent()
        })

        this.eventHandler.on("attached-to-parent", () => {
            this.updateParent()
        })
    }

    private updateParent() {
        for (let transmitterSet of this.transmitterSets.values()) {
            transmitterSet.updateParent()
        }
    }

    hasTransmitterSetForEnd(receivingEnd: ReceivingEnd) {
        return this.transmitterSets.has(receivingEnd)
    }

    transmitterSetFor(receivingEnd: ReceivingEnd) {
        return this.transmitterSets.get(receivingEnd)
    }

    createTransmitterSetFor(receivingEnd: ReceivingEnd) {
        if (this.hasTransmitterSetForEnd(receivingEnd)) {
            throw new Error("Transmitter set already exists for this receiving end")
        }

        let transmitterSet = new TransmitterSet(receivingEnd)
        transmitterSet.transmitComponent = this
        this.transmitterSets.set(receivingEnd, transmitterSet)
        this.entity.emit("transmitter-set-added", transmitterSet)
        receivingEnd.emit("transmitter-set-added", transmitterSet)

        transmitterSet.updateParent()

        return transmitterSet
    }

    clearTransmitterSets() {
        for(let end of this.transmitterSets.keys()) {
            this.removeTransmitterSetFor(end)
        }
    }

    removeTransmitterSetFor(receivingEnd: ReceivingEnd) {
        let transmitterSet = this.transmitterSets.get(receivingEnd)
        this.entity.emit("transmitter-set-removed", transmitterSet)
        receivingEnd.emit("transmitter-set-removed", transmitterSet)
        if (transmitterSet) {
            // Notify the transmitter set that it's about to detach
            transmitterSet.setIdTable(null)
            transmitterSet.transmitComponent = null
            transmitterSet.updateParent()
            this.transmitterSets.delete(receivingEnd)
        }
    }

    detachReceivingEnd(end: ReceivingEnd) {
        this.ends.delete(end)
        this.transmitterSets.get(end)?.updateParent()
    }

    attachReceivingEnd(end: ReceivingEnd) {
        this.ends.add(end)
        this.transmitterSets.get(end)?.updateParent()
    }
}