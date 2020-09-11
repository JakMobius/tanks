
const BinaryPacket = require("../binarypacket")

class RoomListPacket extends BinaryPacket {
    static typeName() { return 16 }
    constructor(rooms) {
        super();
        this.rooms = rooms
    }

    toBinary(encoder) {
        encoder.writeUint8(this.rooms.length)

        for(let room of this.rooms) {
            encoder.writeString(room.name)
            encoder.writeUint16(room.online)
            encoder.writeUint16(room.maxOnline)
        }
    }

    static fromBinary(decoder) {
        let rooms = []

        let count = decoder.readUint8()
        for(let i = 0; i < count; i++) {
            let name = decoder.readString()
            let online = decoder.readUint16()
            let maxOnline = decoder.readUint16()

            rooms.push({
                name: name,
                online: online,
                maxOnline: maxOnline
            })
        }

        return new RoomListPacket(rooms)
    }
}

BinaryPacket.register(RoomListPacket)
module.exports = RoomListPacket