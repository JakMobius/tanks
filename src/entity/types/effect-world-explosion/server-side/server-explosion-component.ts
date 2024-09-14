import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import {Commands} from "src/entity/components/network/commands";

export class ExplodeTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("explode", (x: number, y: number, power: number) => {
            this.sendExplosion(x, y, power)
        })
    }

    sendExplosion(x: number, y: number, power: number) {
        this.packIfEnabled(Commands.EXPLODE_COMMAND, (buffer) => {
            buffer.writeFloat64(x)
            buffer.writeFloat64(y)
            buffer.writeFloat64(power)
        })
    }
}

export default class ServerExplosionComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (set: TransmitterSet) => {
            set.initializeTransmitter(ExplodeTransmitter)
        })
    }
}