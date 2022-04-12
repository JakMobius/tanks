
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binary-encoder";
import BinaryDecoder from "../../../serialization/binary/binary-decoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

export default class EffectRemovePacket extends BinaryPacket {
	public effectId: number;

    static typeName = 19

    constructor(id: number) {
        super();
        this.effectId = id
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeFloat64(this.effectId)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        return new this(decoder.readFloat64())
    }
}

BinarySerializer.register(EffectRemovePacket)