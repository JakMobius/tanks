
import BinaryPacket from '../../binarypacket';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";

class RoomListRequestPacket extends BinaryPacket {
	public request: boolean;

    static typeName = 5

    /**
     * @param {boolean} request Indicates if room list update should be enabled.
     */
    constructor(request: boolean) {
        super();
        this.request = request
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint8(this.request as any as number)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        return new RoomListRequestPacket(decoder.readUint8() as any as boolean) as any as T
    }
}

BinarySerializer.register(RoomListRequestPacket)
export default RoomListRequestPacket;