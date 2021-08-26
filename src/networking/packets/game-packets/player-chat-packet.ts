
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binary-encoder";
import BinaryDecoder from "../../../serialization/binary/binary-decoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

export default class PlayerChatPacket extends BinaryPacket {
	public text: string;

    static typeName = 8

    constructor(text: string) {
        super();
        this.text = text
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeString(this.text)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        return new PlayerChatPacket(decoder.readString()) as any as T
    }
}

BinarySerializer.register(PlayerChatPacket)