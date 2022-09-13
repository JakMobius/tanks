import HierarchicalComponent from "src/entity/components/hierarchical-component";
import {TransmitterSet} from "./transmitter-set";
import {ReceivingEnd} from "./receiving-end";

export default class EntityDataTransmitComponent extends HierarchicalComponent {
    childTransmitComponents = new Map<number, EntityDataTransmitComponent>()
    transmitterSets = new Map<ReceivingEnd, TransmitterSet>()
    networkIdentifier: number | null = null
    configScriptIndex: number = 0
    visibleAnywhere: boolean = false

    private entitiesCreated: number = 0

    constructor() {
        super();

        this.eventHandler.on("will-detach-from-parent", (child, parent) => {
            for(let set of this.transmitterSets.values()) {
                // This condition just reduces complexity
                if(set.isAttachedToRoot()) set.handleParentDetach(parent)
            }
        })

        this.eventHandler.on("attached-to-parent", () => {
            for(let set of this.transmitterSets.values()) {
                if(!set.isAttachedToRoot()) set.handleTreeChange()
            }
        })
    }

    setConfigScriptIndex(index: number) {
        this.configScriptIndex = index
    }

    hasTransmitterSetForEnd(receivingEnd: ReceivingEnd) {
        return this.transmitterSets.has(receivingEnd)
    }

    createTransmitterSetFor(receivingEnd: ReceivingEnd) {
        if(this.hasTransmitterSetForEnd(receivingEnd)) {
            throw new Error("Transmitter set already exists for this receiving end")
        }

        let transmitterSet = new TransmitterSet(receivingEnd)
        transmitterSet.setTransmitComponent(this)
        this.transmitterSets.set(receivingEnd, transmitterSet)
        this.entity.emit("transmitter-set-attached", transmitterSet)
        receivingEnd.emit("transmitter-set-attached", transmitterSet)
        return transmitterSet
    }

    transmitterSetFor(receivingEnd: ReceivingEnd) {
        return this.transmitterSets.get(receivingEnd)
    }

    removeTransmitterSet(receivingEnd: ReceivingEnd) {
        let transmitterSet = this.transmitterSets.get(receivingEnd)
        receivingEnd.emit("transmitter-set-detached", transmitterSet)
        if(transmitterSet) {
            transmitterSet.setTransmitComponent(null)
            this.transmitterSets.delete(receivingEnd)
        }
    }

    protected childComponentAdded(component: EntityDataTransmitComponent) {
        component.networkIdentifier = this.nextUnusedNetworkIdentifier()
        this.childTransmitComponents.set(component.networkIdentifier, component)
    }

    protected childComponentDetached(component: EntityDataTransmitComponent) {
        this.childTransmitComponents.delete(component.networkIdentifier)
    }

    private nextUnusedNetworkIdentifier() {
        return this.entitiesCreated++
    }
}