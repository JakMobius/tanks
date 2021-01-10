
import BinaryPacket from '../../binarypacket';
import ClusterHandshake from '../../../server/socket/cluster-handshake';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";

class HandshakePacket extends BinaryPacket {

    handshakeData: Uint8Array

    constructor(data: Uint8Array) {
        super();
        this.handshakeData = data
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint8Array(this.handshakeData)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        return new this(decoder.readUint8(ClusterHandshake.handshakeBytes))
    }

    static typeName = 1001
}

BinarySerializer.register(HandshakePacket)
export default HandshakePacket;