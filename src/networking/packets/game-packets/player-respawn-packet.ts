import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";

export default class PlayerRespawnPacket extends BinaryPacket {
    static typeName = 9

    toBinary(encoder: WriteBuffer): void {}
    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T { return new this() }
}

BinarySerializer.register(PlayerRespawnPacket)