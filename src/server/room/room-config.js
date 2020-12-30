
const BinarySerializable = require("/src/serialization/binary/serializable")

class RoomConfig extends BinarySerializable {

    /**
     * @type {string}
     */
    name

    /**
     * @type {string}
     */
    map

    constructor() {
        super();
    }

    toBinary(encoder) {
        encoder.writeString(this.name)
        encoder.writeString(this.map)
    }

    static fromBinary(decoder) {
        let name = decoder.readString()
        let map = decoder.readString()

        let instance = new RoomConfig()
        instance.name = name
        instance.map = map

        return instance
    }
}

module.exports = RoomConfig