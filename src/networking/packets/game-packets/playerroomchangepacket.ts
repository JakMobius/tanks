
import BinaryPacket from '../../binarypacket';

class PlayerRoomChangePacket extends BinaryPacket {
	public room: any;
	public error: any;

    static typeName() {
        return 18
    }

    constructor(room, error?) {
        super();

        this.room = room
        this.error = error
    }

    toBinary(encoder) {
        encoder.writeUint8(this.error ? 0 : 1)
        encoder.writeString(this.room)
        if(this.error) {
            encoder.writeString(this.error)
        }
    }

    static fromBinary(decoder) {
        let isSuccess = decoder.readUint8()
        let room = decoder.readString()
        let error = isSuccess ? null : decoder.readString()

        return new this(room, error)
    }

    static allow(room) {
        return new this(room)
    }

    static deny(room, error) {
        return new this(room, error)
    }
}

BinaryPacket.register(PlayerRoomChangePacket)
export default PlayerRoomChangePacket;