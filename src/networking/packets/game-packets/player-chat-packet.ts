import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";
import {Constructor} from "src/utils/constructor";

export default class PlayerChatPacket extends BinaryPacket {
	public text: string;

    static typeName = 8

    constructor(text: string) {
        super();
        this.text = text
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeString(this.text)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new PlayerChatPacket(decoder.readString()) as any as T
    }
}

BinarySerializer.register(PlayerChatPacket)