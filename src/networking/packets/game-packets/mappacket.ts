
import BinaryPacket from '../../binarypacket';
import GameMap from '../../../utils/map/gamemap';

class MapPacket extends BinaryPacket {
	public map: any;

    static typeName() {
        return 1
    }

    static requireLargeIndices = true

    constructor(map) {
        super();

        this.map = map
    }

    static fromBinary(decoder) {
        let map = GameMap.fromBinary(decoder)
        map.update()
        return new MapPacket(map)
    }

    toBinary(encoder) {
        this.map.toBinary(encoder, [
            GameMap.BinaryOptions.SIZE_FLAG,
            GameMap.BinaryOptions.DATA_FLAG
        ])
    }
}

BinaryPacket.register(MapPacket)

export default MapPacket;