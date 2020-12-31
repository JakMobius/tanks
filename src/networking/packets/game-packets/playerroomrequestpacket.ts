
import BinaryPacket from '../../binarypacket';

/**
 * This packet is sent when player wants to join the room
 */
class PlayerRoomRequestPacket extends BinaryPacket {
	public room: any;

    static typeName() { return 17 }

    constructor(room) {
        super();

        this.room = room
    }

    toBinary(encoder) {
        encoder.writeString(this.room)
    }

    static fromBinary(decoder) {
        return new PlayerRoomRequestPacket(decoder.readString())
    }
}

BinaryPacket.register(PlayerRoomRequestPacket)
export default PlayerRoomRequestPacket;