import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";

/**
 * This packet is sent by hub when handshake succeeds
 */

export default class HandshakeSuccessPacket extends BinaryPacket {
    static typeName = 1002
    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer) { return new this() }
}

BinarySerializer.register(HandshakeSuccessPacket)
