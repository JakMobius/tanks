
import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../serialization/binary/binary-decoder";
import BinaryEncoder from "../../../serialization/binary/binary-encoder";

/**
 * This packet is sent when player wants to join the room
 */
export default class PlayerRoomRequestPacket extends BinaryPacket {
	public room: any;

    static typeName = 17

    constructor(room: string) {
        super();

        this.room = room
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeString(this.room)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        return new PlayerRoomRequestPacket(decoder.readString()) as any as T
    }
}

BinarySerializer.register(PlayerRoomRequestPacket)