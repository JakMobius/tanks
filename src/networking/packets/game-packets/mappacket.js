
const BinaryPacket = require("../../binarypacket")
const GameMap = require("../../../utils/map/gamemap")

class MapPacket extends BinaryPacket {
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

module.exports = MapPacket