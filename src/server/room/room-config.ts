
import {BinaryCodable, Constructor} from 'src/serialization/binary/serializable';
import BinaryEncoder from "../../legacy/serialization-v0001/binary/binary-encoder";
import BinaryDecoder from "../../legacy/serialization-v0001/binary/binary-decoder";
import WriteBuffer from "../../serialization/binary/write-buffer";
import ReadBuffer from "../../serialization/binary/read-buffer";

class RoomConfig implements BinaryCodable<typeof RoomConfig> {

    constructor() {

    }

    name: string
    map: string

    toBinary(encoder: WriteBuffer) {
        encoder.writeString(this.name)
        encoder.writeString(this.map)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let name = decoder.readString()
        let map = decoder.readString()

        let instance = new RoomConfig()
        instance.name = name
        instance.map = map

        return instance as any as T
    }
}

export default RoomConfig;