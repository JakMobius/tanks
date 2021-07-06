
import PlayerJoinPacket from './playerjoinpacket';
import {BinarySerializer} from "../../../serialization/binary/serializable";

/**
 * This packet represents player spawn interact.
 * The difference to the `PlayerJoinPacket`
 * package is that this package is only sent
 * to the player who entered the screen.
 */

class PlayerSpawnPacket extends PlayerJoinPacket {
    static typeName = 3
}

BinarySerializer.register(PlayerSpawnPacket)

export default PlayerSpawnPacket;