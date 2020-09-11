
const TankModel = require("../../tanks/tankmodel")
const BinaryPacket = require("../binarypacket")
const Player = require("../../utils/player")

/**
 * This packet is representing a player join interact.
 */

class PlayerJoinPacket extends BinaryPacket {
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

module.exports = PlayerJoinPacket