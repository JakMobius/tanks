import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import PositionTransmitter from "src/entity/components/network/position/position-transmitter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class PositionTransmitComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(PositionTransmitter)
        })
    }
}