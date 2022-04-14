
import BinaryPacket from '../../binary-packet';
import RoomConfig from 'src/server/room/room-config';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class RoomCreationRequestPacket extends BinaryPacket {
	public config: RoomConfig;

    static typeName = 1003

    constructor(config: RoomConfig) {
        super();
        this.config = config
    }

    toBinary(encoder: WriteBuffer): void {
        this.config.toBinary(encoder)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let config = RoomConfig.fromBinary(decoder)
        return new RoomCreationRequestPacket(config) as any as T
    }
}

BinarySerializer.register(RoomCreationRequestPacket)