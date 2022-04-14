
import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class RoomListRequestPacket extends BinaryPacket {
	public request: boolean;

    static typeName = 5

    /**
     * @param request Indicates if room list update should be enabled.
     */
    constructor(request: boolean) {
        super();
        this.request = request
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint8(this.request as any as number)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        return new RoomListRequestPacket(decoder.readUint8() as any as boolean) as any as T
    }
}

BinarySerializer.register(RoomListRequestPacket)