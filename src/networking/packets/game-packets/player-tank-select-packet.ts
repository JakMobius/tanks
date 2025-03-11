import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";
import {Constructor} from "src/utils/constructor";

export default class PlayerTankSelectPacket extends BinaryPacket {
    static typeName = 5
    tank: string

    constructor(tank: string) {
        super();
        this.tank = tank
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeString(this.tank)
    }
    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new this(decoder.readString())
    }
}

BinarySerializer.register(PlayerTankSelectPacket)