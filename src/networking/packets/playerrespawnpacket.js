
const BinaryPacket = require("../binarypacket")

class PlayerRespawnPacket extends BinaryPacket {
    static typeName() { return 9 }

    toBinary(encoder) {}
}

BinaryPacket.register(PlayerRespawnPacket)

module.exports = PlayerRespawnPacket