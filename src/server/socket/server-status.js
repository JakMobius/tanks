
const BinarySerializable = require("../../serialization/binary/serializable")

class ServerStatus extends BinarySerializable {
    identifier
    roomsActive

    toBinary(encoder) {

    }

    static fromBinary(decoder) {

    }

    static groupName() { return 6 }
    static typeName() { return 0 }
}

module.exports = ServerStatus