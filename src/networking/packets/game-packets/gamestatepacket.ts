

import BinaryPacket from '../../binarypacket';

class TankLocationsPacket extends BinaryPacket {
	public players: any;

    static typeName() {
        return 4
    }

    /**
     * Creates a packet that contains information about
     * location and speed of each player in your map.
     * @param players {Map<Number, Player>} Tank map to be encoded
     */

    constructor(players) {
        super();

        this.players = players
    }

    toBinary(encoder) {
        encoder.writeUint16(this.players.size)

        for (let [key, player] of this.players) {
            encoder.writeUint32(key)
            player.tank.encodeDynamicData(encoder)
        }
    }

    /**
     * Updates tank positions based on packet data.
     * @param players {Map<Number, Player>} Map containing each player
     */
    updateTankLocations(players) {
        if (!this.decoder) {
            throw new Error("This packet is not valid anymore: The decoder buffer has been reused.")
        }

        this.decoder.save()

        let count = this.decoder.readUint16()
        while (count--) {
            let key = this.decoder.readUint32()

            let player = players.get(key)
            player.tank.decodeDynamicData(this.decoder, true)
        }

        this.decoder.restore()
    }
}

BinaryPacket.register(TankLocationsPacket)

export default TankLocationsPacket;