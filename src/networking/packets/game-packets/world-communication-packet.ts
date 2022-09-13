import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class WorldCommunicationPacket extends BinaryPacket {
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
        return new WorldCommunicationPacket(decoder.readBytes(decoder.readUint32())) as any as T
    }
}

BinarySerializer.register(WorldCommunicationPacket)