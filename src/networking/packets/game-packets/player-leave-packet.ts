
import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import AbstractPlayer from "../../../abstract-player";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";

export default class PlayerLeavePacket extends BinaryPacket {
	public playerId: number;

    static typeName = 15

    constructor(player?: AbstractPlayer) {
        super();

        this.playerId = player ? player.id : 0
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint32(this.playerId)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let packet = new PlayerLeavePacket()
        packet.playerId = decoder.readUint32()
        return packet as any as T
    }
}

BinarySerializer.register(PlayerLeavePacket)