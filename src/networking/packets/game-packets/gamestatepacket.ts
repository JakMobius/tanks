

import BinaryPacket from '../../binarypacket';
import Player from "../../../utils/player";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import {BinarySerializer} from "../../../serialization/binary/serializable";

class TankLocationsPacket extends BinaryPacket {
	public players: Map<number, Player>;

    static typeName = 4

    /**
     * Creates a packet that contains information about
     * location and speed of each player in your map.
     * @param players {Map<Number, Player>} Tank map to be encoded
     */

    constructor(players: Map<number, Player>) {
        super();

        this.players = players
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint16(this.players.size)

        for (let [key, player] of this.players) {
            encoder.writeUint32(key)
            player.tank.encodeDynamicData(encoder)
        }
    }

    /**
     * Updates tank positions based on packet data.
     * @param players Map containing each player
     */
    updateTankLocations(players: Map<number, Player>) {
        if (!this.decoder) {
            throw new Error("This packet is not valid anymore: The decoder buffer has been reused.")
        }

        this.decoder.save()

        let count = this.decoder.readUint16()
        while (count--) {
            let key = this.decoder.readUint32()

            let player = players.get(key)
            player.tank.decodeDynamicData(this.decoder)
        }

        this.decoder.restore()
    }
}

BinarySerializer.register(TankLocationsPacket)

export default TankLocationsPacket;