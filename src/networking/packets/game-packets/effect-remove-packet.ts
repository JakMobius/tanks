
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../legacy/serialization-v0001/binary/binary-encoder";
import BinaryDecoder from "../../../legacy/serialization-v0001/binary/binary-decoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class EffectRemovePacket extends BinaryPacket {
	public effectId: number;

    static typeName = 19

    constructor(id: number) {
        super();
        this.effectId = id
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeFloat64(this.effectId)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new this(decoder.readFloat64())
    }
}

BinarySerializer.register(EffectRemovePacket)