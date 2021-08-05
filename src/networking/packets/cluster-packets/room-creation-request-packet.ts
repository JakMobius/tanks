
import BinaryPacket from '../../binary-packet';
import RoomConfig from 'src/server/room/room-config';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

export default class RoomCreationRequestPacket extends BinaryPacket {
	public config: RoomConfig;

    static typeName = 1003

    constructor(config: RoomConfig) {
        super();
        this.config = config
    }

    toBinary(encoder: BinaryEncoder) {
        this.config.toBinary(encoder)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let config = RoomConfig.fromBinary(decoder)
        return new RoomCreationRequestPacket(config) as any as T
    }
}

BinarySerializer.register(RoomCreationRequestPacket)