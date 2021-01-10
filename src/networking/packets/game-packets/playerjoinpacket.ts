
import TankModel from '../../../tanks/tankmodel';
import BinaryPacket from '../../binarypacket';
import Player from '../../../utils/player';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";

/**
 * This packet is representing a player join interact.
 */

class PlayerJoinPacket extends BinaryPacket {
	public player: any;
	public tank: any;

    static typeName = 2

    constructor(player: Player, tank: TankModel) {
        super();

        this.player = player
        this.tank = tank
        this.decoder = null
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint16(this.player.id)
        encoder.writeString(this.player.nick)

        BinarySerializer.serialize(this.tank, encoder)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let player = new Player()
        player.id = decoder.readUint16()
        player.nick = decoder.readString()

        let tank = BinarySerializer.deserialize(decoder, TankModel)

        return new this(player, tank)
    }

}

BinarySerializer.register(PlayerJoinPacket)

export default PlayerJoinPacket;