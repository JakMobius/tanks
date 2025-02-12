import {BinaryCodable} from 'src/serialization/binary/serializable';
import WriteBuffer from "src/serialization/binary/write-buffer";
import ReadBuffer from "src/serialization/binary/read-buffer";
import {Constructor} from "src/utils/constructor";

export default class RoomConfig implements BinaryCodable<typeof RoomConfig> {

    constructor() {

    }

    name: string
    map: string
    mode: string

    toBinary(encoder: WriteBuffer) {
        encoder.writeString(this.name)
        encoder.writeString(this.map)
        encoder.writeString(this.mode)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let instance = new RoomConfig()
        instance.name = decoder.readString()
        instance.map = decoder.readString()
        instance.mode = decoder.readString()

        return instance as any as T
    }
}