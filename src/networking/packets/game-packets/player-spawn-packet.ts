
import PlayerJoinPacket from './player-join-packet';
import {BinarySerializer} from "../../../serialization/binary/serializable";

/**
 * This packet represents player spawn interact.
 * The difference to the `PlayerJoinPacket`
 * package is that this package is only sent
 * to the player who entered the screen.
 */

export default class PlayerSpawnPacket extends PlayerJoinPacket {
    static typeName = 3
}

BinarySerializer.register(PlayerSpawnPacket)