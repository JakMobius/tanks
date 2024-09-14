import Transmitter from "src/entity/components/network/transmitting/transmitter";
import {Commands} from "src/entity/components/network/commands";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";

export class FlameTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("set-firing", (firing: boolean) => {
            this.packIfEnabled(Commands.SET_FIRING_COMMAND, (buffer) => {
                buffer.writeFloat64(firing ? 1 : 0)
            })
        })
    }
}

export default class ServerFlameEffectComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (set: TransmitterSet) => {
            set.initializeTransmitter(FlameTransmitter)
        })
    }
}