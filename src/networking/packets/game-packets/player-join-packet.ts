
import TankModel from '../../../entity/tanks/tank-model';
import BinaryPacket from '../../binary-packet';
import AbstractPlayer from '../../../abstract-player';
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";

/**
 * This packet is representing a player join interact.
 */

export default class PlayerJoinPacket extends BinaryPacket {
	public tankId: number;
    public nick: string;
    public id: number;

    static typeName = 2

    constructor(nick: string, id: number, tankId: number) {
        super();

        this.nick = nick
        this.id = id
        this.tankId = tankId
        this.decoder = null
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint16(this.id)
        encoder.writeString(this.nick)
        encoder.writeUint32(this.tankId)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let id = decoder.readUint16()
        let nick = decoder.readString()
        let tankId = decoder.readUint32()

        return new this(nick, id, tankId)
    }

}

BinarySerializer.register(PlayerJoinPacket)