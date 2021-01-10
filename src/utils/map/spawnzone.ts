
import Rectangle from '../../utils/rectangle';
import BinaryDecoder from "../../serialization/binary/binarydecoder";
import {Constructor} from "../../serialization/binary/serializable";
import BinaryEncoder from "../../serialization/binary/binaryencoder";

class SpawnZone extends Rectangle {
	public id: number;

    constructor(id: number) {
        super()
        this.id = id
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let zone = new this(decoder.readUint8()) as any as SpawnZone
        zone.setFrom(decoder.readUint32(), decoder.readUint32())
        zone.setTo(decoder.readUint32(), decoder.readUint32())
        return zone as any as T
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint8(this.id)
        encoder.writeUint32(this.x1)
        encoder.writeUint32(this.y1)
        encoder.writeUint32(this.x2)
        encoder.writeUint32(this.y2)
    }
}

export default SpawnZone;