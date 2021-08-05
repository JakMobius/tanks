
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

export default class EffectRemovePacket extends BinaryPacket {
	public id: number;

    static typeName = 19

    constructor(id: number) {
        super();
        this.id = id
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeFloat64(this.id)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        return new this(decoder.readFloat64())
    }
}

BinarySerializer.register(EffectRemovePacket)