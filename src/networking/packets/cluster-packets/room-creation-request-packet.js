
const BinaryPacket = require("../../binarypacket")
const RoomConfig = require("/src/server/room/room-config")

class RoomCreationRequestPacket extends BinaryPacket {
    static typeName() { return 1003 }

    /**
     * @param config {RoomConfig} Configuration of room to create
     */
    constructor(config) {
        super();
        this.config = config
    }

    toBinary(encoder) {
        this.config.toBinary(encoder)
    }

    static fromBinary(decoder) {

        let config = /** @type {RoomConfig} */ RoomConfig.fromBinary(decoder)
        return new RoomCreationRequestPacket(config)
    }
}

BinaryPacket.register(RoomCreationRequestPacket)
module.exports = RoomCreationRequestPacket