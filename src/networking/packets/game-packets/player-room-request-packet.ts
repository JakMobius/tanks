import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

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

    toBinary(encoder: WriteBuffer): void {
        encoder.writeString(this.room)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new PlayerRoomRequestPacket(decoder.readString()) as any as T
    }
}

BinarySerializer.register(PlayerRoomRequestPacket)