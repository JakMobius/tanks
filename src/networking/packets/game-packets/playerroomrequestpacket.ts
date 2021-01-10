
import BinaryPacket from '../../binarypacket';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";

/**
 * This packet is sent when player wants to join the room
 */
class PlayerRoomRequestPacket extends BinaryPacket {
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
export default PlayerRoomRequestPacket;