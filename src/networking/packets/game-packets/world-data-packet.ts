import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";
import {Constructor} from "src/utils/constructor";

export default class WorldDataPacket extends BinaryPacket {
    static typeName = 22

    buffer: Uint8Array

    constructor(buffer: Uint8Array = new Uint8Array()) {
        super()
        this.buffer = buffer
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint32(this.buffer.length)
        encoder.writeBytes(this.buffer)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new WorldDataPacket(decoder.readBytes(decoder.readUint32())) as any as T
    }
}

BinarySerializer.register(WorldDataPacket)