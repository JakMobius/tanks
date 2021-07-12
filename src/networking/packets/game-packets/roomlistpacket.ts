
import BinaryPacket from '../../binarypacket';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";

export interface ClientRoomInformant {
    getName(): string,
    getCurrentOnline(): number,
    getMaxOnline(): number
}

export class ClientRoomInformation implements ClientRoomInformant {
    constructor(name: string, currentOnline: number, maxOnline: number) {
        this.name = name
        this.currentOnline = currentOnline
        this.maxOnline = maxOnline
    }

    name: string
    currentOnline: number
    maxOnline: number

    getName() { return this.name }
    getCurrentOnline(): number { return this.currentOnline }
    getMaxOnline(): number { return  this.maxOnline }
}

class RoomListPacket extends BinaryPacket {
	public rooms: ClientRoomInformant[];

    static typeName = 16

    constructor(rooms: ClientRoomInformant[]) {
        super();
        this.rooms = rooms
    }

    toBinary(encoder: BinaryEncoder): void {
        encoder.writeUint8(this.rooms.length)

        for(let room of this.rooms) {
            encoder.writeString(room.getName())
            encoder.writeUint16(room.getCurrentOnline())
            encoder.writeUint16(room.getMaxOnline())
        }
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let rooms: ClientRoomInformant[] = []

        let count = decoder.readUint8()
        for(let i = 0; i < count; i++) {
            let name = decoder.readString()
            let online = decoder.readUint16()
            let maxOnline = decoder.readUint16()

            rooms.push(new ClientRoomInformation(name, online, maxOnline))
        }

        return new RoomListPacket(rooms) as any as T
    }
}

BinarySerializer.register(RoomListPacket)
export default RoomListPacket;