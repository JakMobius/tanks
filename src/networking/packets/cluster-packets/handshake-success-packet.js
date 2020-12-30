
const BinaryPacket = require("../../binarypacket")

/**
 * This packet is sent by hub when handshake succeeds
 */

class HandshakeSuccessPacket extends BinaryPacket {
    static typeName() { return 1002 }
    toBinary(encoder) {}
    static fromBinary(decoder) { return new this() }
}

BinaryPacket.register(HandshakeSuccessPacket)

module.exports = HandshakeSuccessPacket
