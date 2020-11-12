
const BinaryPacket = require("../../binarypacket")

class RoomListRequestPacket extends BinaryPacket {
    static typeName() { return 5 }

    /**
     * @param {boolean} request Indicates if room list update should be enabled.
     */
    constructor(request) {
        super();
        this.request = request
    }

    toBinary(encoder) {
        /** @type {number} */
        const byte = this.request ? 1 : 0
        encoder.writeUint8(byte)
    }

    static fromBinary(decoder) {
        return new RoomListRequestPacket(decoder.readUint8())
    }
}

BinaryPacket.register(RoomListRequestPacket)
module.exports = RoomListRequestPacket