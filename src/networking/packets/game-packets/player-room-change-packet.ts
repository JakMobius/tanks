import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class PlayerRoomChangePacket extends BinaryPacket {
	public room: string;
	public error: string;

    static typeName = 18

    constructor(room: string, error?: string) {
        super();

        this.room = room
        this.error = error
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint8(this.error ? 0 : 1)
        encoder.writeString(this.room)
        if(this.error) {
            encoder.writeString(this.error)
        }
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let isSuccess = decoder.readUint8()
        let room = decoder.readString()
        let error = isSuccess ? null : decoder.readString()

        return new this(room, error)
    }

    static allow(room: string) {
        return new this(room)
    }

    static deny(room: string, error: string) {
        return new this(room, error)
    }
}

BinarySerializer.register(PlayerRoomChangePacket)