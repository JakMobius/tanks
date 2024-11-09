import Transmitter from "src/entity/components/network/transmitting/transmitter";
import {Commands} from "src/entity/components/network/commands";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";

export class PelletsTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("trigger", () => {
            this.packIfEnabled(Commands.PELLETS_TRIGGER_COMMAND, (buffer) => {
            })
        })
    }
}

export default class ServerPelletsEffectComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (set: TransmitterSet) => {
            set.initializeTransmitter(PelletsTransmitter)
        })
    }
}