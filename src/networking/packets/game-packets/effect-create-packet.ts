
import BinaryPacket from '../../binary-packet';
import EffectModel from 'src/effects/effect-model';
import BinaryDecoder from "../../../serialization/binary/binary-decoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binary-encoder";

export default class EffectCreatePacket extends BinaryPacket {
	public effect: EffectModel;

    static typeName = 14

    constructor(effect: EffectModel) {
        super()

        this.effect = effect
    }

    toBinary(encoder: BinaryEncoder) {
        BinarySerializer.serialize(this.effect, encoder)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        const effect = BinarySerializer.deserialize(decoder, EffectModel)

        return new this(effect)
    }
}

BinarySerializer.register(EffectCreatePacket)