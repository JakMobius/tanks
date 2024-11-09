import BinaryPacket from '../../binary-packet';
import {BinarySerializer} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";
import {Constructor} from "src/utils/constructor";

export default class PlayerTankSelectPacket extends BinaryPacket {
    static typeName = 5
    tank: number

    constructor(tank: number) {
        super();
        this.tank = tank
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeInt16(this.tank)
    }
    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T { return new this(decoder.readInt16()) }
}

BinarySerializer.register(PlayerTankSelectPacket)