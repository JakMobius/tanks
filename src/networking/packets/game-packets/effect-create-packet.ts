
import BinaryPacket from '../../binary-packet';
import EffectModel from 'src/effects/effect-model';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class EffectCreatePacket extends BinaryPacket {
	public effect: EffectModel;

    static typeName = 14

    constructor(effect: EffectModel) {
        super()

        this.effect = effect
    }

    toBinary(encoder: WriteBuffer): void {
        BinarySerializer.serialize(this.effect, encoder)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        const effect = BinarySerializer.deserialize(decoder, EffectModel)

        return new this(effect)
    }
}

BinarySerializer.register(EffectCreatePacket)