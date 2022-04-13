
import Rectangle from '../utils/rectangle';
import BinaryDecoder from "../legacy/serialization-v0001/binary/binary-decoder";
import {Constructor} from "../serialization/binary/serializable";
import BinaryEncoder from "../legacy/serialization-v0001/binary/binary-encoder";
import ReadBuffer from "../serialization/binary/read-buffer";
import WriteBuffer from "../serialization/binary/write-buffer";

class SpawnZone extends Rectangle {
	public id: number;

    constructor(id: number) {
        super()
        this.id = id
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let id = decoder.readInt8()
        let x1 = decoder.readInt32()
        let y1 = decoder.readInt32()
        let x2 = decoder.readInt32()
        let y2 = decoder.readInt32()

        let zone = new this(id) as any as SpawnZone
        zone.setFrom(x1, y1)
        zone.setTo(x2, y2)
        return zone as any as T
    }

    toBinary(encoder: WriteBuffer) {
        encoder.writeInt8(this.id)
        encoder.writeInt32(this.x1)
        encoder.writeInt32(this.y1)
        encoder.writeInt32(this.x2)
        encoder.writeInt32(this.y2)
    }
}

export default SpawnZone;