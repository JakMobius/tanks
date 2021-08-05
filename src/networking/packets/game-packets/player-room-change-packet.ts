
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

export default class PlayerRoomChangePacket extends BinaryPacket {
	public room: string;
	public error: string;

    static typeName = 18

    constructor(room: string, error?: string) {
        super();

        this.room = room
        this.error = error
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint8(this.error ? 0 : 1)
        encoder.writeString(this.room)
        if(this.error) {
            encoder.writeString(this.error)
        }
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
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