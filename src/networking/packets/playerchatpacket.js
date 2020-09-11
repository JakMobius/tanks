
const BinaryPacket = require("../binarypacket")

class PlayerChatPacket extends BinaryPacket {
    static typeName() { return 8 }

    constructor(text) {
        super();
        this.text = text
    }

    toBinary(encoder) {
        encoder.writeString(this.text)
    }

    static fromBinary(decoder) {
        return new PlayerChatPacket(decoder.readString())
    }
}

BinaryPacket.register(PlayerChatPacket)
module.exports = PlayerChatPacket