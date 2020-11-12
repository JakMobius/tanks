
const BinaryPacket = require("../../binarypacket")
const ClusterHandshake = require("../../../server/socket/cluster-handshake")

class HandshakePacket extends BinaryPacket {

    handshakeData

    constructor(data) {
        super();
        this.handshakeData = data
    }

    toBinary(encoder) {
        encoder.writeUint8Array(this.handshakeData)
    }

    static fromBinary(decoder) {
        return new this(decoder.readUint8(ClusterHandshake.handshakeBytes))
    }

    static typeName() { return 1001 }
}

BinaryPacket.register(HandshakePacket)
module.exports = HandshakePacket