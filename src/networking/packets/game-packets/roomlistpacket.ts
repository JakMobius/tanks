
import BinaryPacket from '../../binarypacket';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";

export interface ClientRoomInformation {
    name: string,
    currentOnline: number,
    maxOnline: number
}

class RoomListPacket extends BinaryPacket {
	public rooms: ClientRoomInformation[];

    static typeName = 16

    constructor(rooms: ClientRoomInformation[]) {
        super();
        this.rooms = rooms
    }

    toBinary(encoder: BinaryEncoder): void {
        encoder.writeUint8(this.rooms.length)

        for(let room of this.rooms) {
            encoder.writeString(room.name)
            encoder.writeUint16(room.currentOnline)
            encoder.writeUint16(room.maxOnline)
        }
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let rooms: ClientRoomInformation[] = []

        let count = decoder.readUint8()
        for(let i = 0; i < count; i++) {
            let name = decoder.readString()
            let online = decoder.readUint16()
            let maxOnline = decoder.readUint16()

            rooms.push({
                name: name,
                currentOnline: online,
                maxOnline: maxOnline
            })
        }

        return new RoomListPacket(rooms) as any as T
    }
}

BinarySerializer.register(RoomListPacket)
export default RoomListPacket;