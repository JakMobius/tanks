import HierarchicalComponent from "../../hierarchical-component";
import {TransmitterSet} from "./transmitter-set";
import {ReceivingEnd} from "./receiving-end";

export default class EntityDataTransmitComponent extends HierarchicalComponent {
    childTransmitComponents = new Map<number, EntityDataTransmitComponent>()
    transmitterSets = new Map<ReceivingEnd, TransmitterSet>()
    networkIdentifier: number | null = null

    constructor(identifier: number | null = null) {
        super();
        this.networkIdentifier = identifier

        this.eventHandler.on("attached-to-parent", () => {
            for(let set of this.transmitterSets.values()) {
                set.invalidateNodeDepth()
            }
        })
    }

    getTransmitterSet(connection: ReceivingEnd) {
        let transmitters = this.transmitterSets.get(connection)
        if(!transmitters) {
            transmitters = new TransmitterSet()
            transmitters.transmitComponent = this
            transmitters.receivingEnd = connection
            this.transmitterSets.set(connection, transmitters)
        }
        return transmitters
    }

    removeTransmitterSet(receivingEnd: ReceivingEnd) {
        this.transmitterSets.delete(receivingEnd)
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