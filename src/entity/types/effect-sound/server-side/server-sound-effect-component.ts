import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import {Commands} from "src/entity/components/network/commands";

export class SoundTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("play-sound", (x: number, y: number, index: number) => {
            this.packIfEnabled(Commands.SOUND_COMMAND, (buffer) => {
                buffer.writeFloat64(x)
                buffer.writeFloat64(y)
                buffer.writeUint32(index)
            })
        })
    }
}

export default class ServerSoundEffectComponent extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (set: TransmitterSet) => {
            set.initializeTransmitter(SoundTransmitter)
        })
    }
}