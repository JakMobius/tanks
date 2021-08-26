
import {BinaryCodable, Constructor} from 'src/serialization/binary/serializable';
import BinaryEncoder from "../../serialization/binary/binary-encoder";
import BinaryDecoder from "../../serialization/binary/binary-decoder";

class RoomConfig implements BinaryCodable<typeof RoomConfig> {

    constructor() {

    }

    name: string
    map: string

    toBinary(encoder: BinaryEncoder) {
        encoder.writeString(this.name)
        encoder.writeString(this.map)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let name = decoder.readString()
        let map = decoder.readString()

        let instance = new RoomConfig()
        instance.name = name
        instance.map = map

        return instance as any as T
    }
}

export default RoomConfig;