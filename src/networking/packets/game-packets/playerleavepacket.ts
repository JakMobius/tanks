
import BinaryPacket from '../../binarypacket';

class PlayerLeavePacket extends BinaryPacket {
	public playerId: any;

    static typeName() { return 15 }

    constructor(player?) {
        super();

        this.playerId = player ? player.id : 0
    }

    toBinary(encoder) {
        encoder.writeUint32(this.playerId)
    }

    static fromBinary(decoder) {
        let packet = new PlayerLeavePacket()
        packet.playerId = decoder.readUint32()
        return packet
    }
}

BinaryPacket.register(PlayerLeavePacket)
export default PlayerLeavePacket;