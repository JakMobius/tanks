
import BinaryPacket from '../../binarypacket';

class PlayerRespawnPacket extends BinaryPacket {
    static typeName() { return 9 }

    toBinary(encoder) {}
}

BinaryPacket.register(PlayerRespawnPacket)

export default PlayerRespawnPacket;