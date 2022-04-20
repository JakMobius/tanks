
import AbstractEffect from "../../../../effects/abstract-effect";
import {TransmitterComponent} from "../transmitter-component";
import {BinarySerializer} from "../../../../serialization/binary/serializable";
import {Commands} from "../commands";

export default class EffectTransmitterComponent extends TransmitterComponent {
    constructor() {
        super()

        this.eventHandler.on("effect-create", (effect: AbstractEffect) => {
            this.onPack((context) => {
                context.pack(Commands.EFFECT_CREATE_COMMAND, (buffer) => {
                    BinarySerializer.serialize(effect.model, buffer)
                })
            })
        })
    }
}