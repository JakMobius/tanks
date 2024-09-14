import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import FlagStateTransmitter from "src/entity/types/flag/server-side/flag-state-transmitter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class FlagPositionTransmitComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(FlagStateTransmitter)
        })
    }
}