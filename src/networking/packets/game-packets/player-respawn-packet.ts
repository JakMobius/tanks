
import BinaryPacket from '../../binary-packet';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";

export default class PlayerRespawnPacket extends BinaryPacket {
    static typeName = 9

    toBinary(encoder: BinaryEncoder) {}
    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T { return new this() }
}

BinarySerializer.register(PlayerRespawnPacket)