
const PlayerJoinPacket = require("./playerjoinpacket")
const BinaryPacket = require("../../binarypacket")

/**
 * This packet represents player spawn interact.
 * The difference to the `PlayerSpawnPacket`
 * package is that this package is only sent
 * to the player who entered the screen.
 */

class PlayerSpawnPacket extends PlayerJoinPacket {
    static typeName() { return 3 }
}

BinaryPacket.register(PlayerSpawnPacket)

module.exports = PlayerSpawnPacket