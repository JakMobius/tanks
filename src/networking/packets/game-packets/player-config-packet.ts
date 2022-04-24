import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class PlayerConfigPacket extends BinaryPacket {
	public nick: string;
	public modelId: number;

    static typeName = 7

    constructor(nick: string, model: number) {
        super();
        this.nick = nick
        this.modelId = model
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint16(this.modelId)
        encoder.writeString(this.nick)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let id = decoder.readUint16()
        return new PlayerConfigPacket(decoder.readString(), id) as any as T
    }
}

BinarySerializer.register(PlayerConfigPacket)