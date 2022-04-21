import HierarchicalComponent from "../../hierarchical-component";
import {TransmitterSet} from "./transmitter-set";
import {ReceivingEnd} from "./receiving-end";

export default class EntityDataTransmitComponent extends HierarchicalComponent {
    childTransmitComponents = new Map<number, EntityDataTransmitComponent>()
    transmitterSets = new Map<ReceivingEnd, TransmitterSet>()
    networkIdentifier: number | null = null
    configScriptIndex: number = 0

    constructor(identifier: number | null = null) {
        super();
        this.networkIdentifier = identifier

        this.eventHandler.on("attached-to-parent", () => {
            for(let set of this.transmitterSets.values()) {
                set.handleTreeChange()
            }
        })
    }

    setConfigScriptIndex(index: number) {
        this.configScriptIndex = index
    }

    getTransmitterSet(receivingEnd: ReceivingEnd) {
        let transmitters = this.transmitterSets.get(receivingEnd)
        if(!transmitters) {
            transmitters = new TransmitterSet(receivingEnd)
            transmitters.setTransmitComponent(this)
            this.transmitterSets.set(receivingEnd, transmitters)
        }
        return transmitters
    }

    removeTransmitterSet(receivingEnd: ReceivingEnd) {
        let transmitterSet = this.transmitterSets.get(receivingEnd)
        if(transmitterSet) {
            transmitterSet.setTransmitComponent(null)
            this.transmitterSets.delete(receivingEnd)
        }
    }

    protected childComponentAdded(component: EntityDataTransmitComponent) {
        if (!Number.isInteger(component.networkIdentifier)) {
            throw new Error("Only root transmitter component may have null identifier")
        }
        this.childTransmitComponents.set(component.networkIdentifier, component)
    }

    protected childComponentDetached(component: EntityDataTransmitComponent) {
        this.childTransmitComponents.delete(component.networkIdentifier)
    }
}