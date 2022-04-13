
import BinaryPacket from '../../binary-packet';
import BinaryDecoder from "../../../legacy/serialization-v0001/binary/binary-decoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";

/**
 * This packet is sent by hub when handshake succeeds
 */

export default class HandshakeSuccessPacket extends BinaryPacket {
    static typeName = 1002
    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer) { return new this() }
}

BinarySerializer.register(HandshakeSuccessPacket)
