
import BinaryPacket from '../../binary-packet';
import ClusterHandshake from '../../../server/socket/cluster-handshake';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../legacy/serialization-v0001/binary/binary-decoder";
import BinaryEncoder from "../../../legacy/serialization-v0001/binary/binary-encoder";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class HandshakePacket extends BinaryPacket {

    handshakeData: Uint8Array

    constructor(data: Uint8Array) {
        super();
        this.handshakeData = data
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeBytes(this.handshakeData)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new this(decoder.readBytes(ClusterHandshake.handshakeBytes))
    }

    static typeName = 1001
}

BinarySerializer.register(HandshakePacket)