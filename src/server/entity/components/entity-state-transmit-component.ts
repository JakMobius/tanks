import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import EntityStateTransmitter from "src/entity/components/network/entity/entity-state-transmitter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class EntityStateTransmitComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(EntityStateTransmitter)
        })
    }
}