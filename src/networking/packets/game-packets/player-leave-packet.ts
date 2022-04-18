import BinaryPacket from '../../binary-packet';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import AbstractPlayer from "../../../abstract-player";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class PlayerLeavePacket extends BinaryPacket {
	public playerId: number;

    static typeName = 15

    constructor(player?: AbstractPlayer) {
        super();

        this.playerId = player ? player.id : 0
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint32(this.playerId)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let packet = new PlayerLeavePacket()
        packet.playerId = decoder.readUint32()
        return packet as any as T
    }
}

BinarySerializer.register(PlayerLeavePacket)