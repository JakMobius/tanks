import BinaryPacket from '../../binary-packet';
import ClusterHandshake from '../../../server/socket/cluster-handshake';
import {BinarySerializer, Constructor} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";

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