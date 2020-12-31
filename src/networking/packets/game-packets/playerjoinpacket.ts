
import TankModel from '../../../tanks/tankmodel';
import BinaryPacket from '../../binarypacket';
import Player from '../../../utils/player';

/**
 * This packet is representing a player join interact.
 */

class PlayerJoinPacket extends BinaryPacket {
	public player: any;
	public tank: any;

    static typeName() { return 2 }

    constructor(player, tank) {
        super();

        this.player = player
        this.tank = tank
        this.decoder = null
    }

    toBinary(encoder) {
        encoder.writeUint16(this.player.id)
        encoder.writeString(this.player.nick)

        TankModel.serialize(this.tank, encoder)
    }

    static fromBinary(decoder) {
        let player = new Player()
        player.id = decoder.readUint16()
        player.nick = decoder.readString()

        let tank = TankModel.deserialize(decoder, TankModel)

        return new this(player, tank)
    }

}

BinaryPacket.register(PlayerJoinPacket)

export default PlayerJoinPacket;