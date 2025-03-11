import { PropertyInspector } from "src/entity/components/inspector/property-inspector";
import { TransmitterSet } from "src/entity/components/network/transmitting/transmitter-set";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import CheckpointTransmitter from "./checkpoint-transmitter";

export default class CheckpointComponent extends EventHandlerComponent {
    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            
        })

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(CheckpointTransmitter)
        })
    }
}