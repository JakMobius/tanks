
import BinaryPacket from '../../binarypacket';
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

/**
 * This packet is sent by hub when handshake succeeds
 */

class HandshakeSuccessPacket extends BinaryPacket {
    static typeName = 1002
    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder) { return new this() }
}

BinarySerializer.register(HandshakeSuccessPacket)

export default HandshakeSuccessPacket;
