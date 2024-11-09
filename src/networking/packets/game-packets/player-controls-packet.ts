
import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "src/serialization/binary/serializable";
import WriteBuffer from "src/serialization/binary/write-buffer";
import ReadBuffer from "src/serialization/binary/read-buffer";
import {Constructor} from "src/utils/constructor";

export default class PlayerControlsPacket extends BinaryPacket {
    static typeName = 6
    controlsData: Uint8Array

    constructor(data: Uint8Array) {
        super();
        this.controlsData = data;
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint32(this.controlsData.length)
        encoder.writeBytes(this.controlsData)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new PlayerControlsPacket(decoder.readBytes(decoder.readUint32())) as any as T
    }
}

BinarySerializer.register(PlayerControlsPacket)