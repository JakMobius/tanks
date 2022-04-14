
import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

/**
 * This packet is representing a player join interact.
 */

export default class PlayerJoinPacket extends BinaryPacket {
	public tankId: number;
    public nick: string;
    public id: number;

    static typeName = 2

    constructor(nick: string, id: number, tankId: number) {
        super();

        this.nick = nick
        this.id = id
        this.tankId = tankId
        this.decoder = null
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint16(this.id)
        encoder.writeString(this.nick)
        encoder.writeUint32(this.tankId)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let id = decoder.readUint16()
        let nick = decoder.readString()
        let tankId = decoder.readUint32()

        return new this(nick, id, tankId)
    }

}

BinarySerializer.register(PlayerJoinPacket)