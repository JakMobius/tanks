import BinaryPacket from '../../binary-packet';
import RoomConfig from 'src/server/room/room-config';
import {BinarySerializer} from "src/serialization/binary/serializable";
import ReadBuffer from "src/serialization/binary/read-buffer";
import WriteBuffer from "src/serialization/binary/write-buffer";
import {Constructor} from "src/utils/constructor";

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