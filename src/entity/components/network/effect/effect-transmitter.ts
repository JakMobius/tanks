import AbstractEffect from "src/effects/abstract-effect";
import Transmitter from "../transmitting/transmitter";
import {BinarySerializer} from "src/serialization/binary/serializable";
import {Commands} from "../commands";

export default class EffectTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("effect-create", (effect: AbstractEffect) => {
            this.packIfEnabled(Commands.EFFECT_CREATE_COMMAND, (buffer) => {
                BinarySerializer.serialize(effect.model, buffer)
            })
        })

        this.eventHandler.on("effect-remove", (effect: AbstractEffect) => {
            this.packIfEnabled(Commands.EFFECT_REMOVE_COMMAND, (buffer) => {
                buffer.writeFloat64(effect.model.id)
            })
        })
    }
}