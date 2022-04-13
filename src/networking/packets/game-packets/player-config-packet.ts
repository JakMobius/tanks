
import BinaryPacket from '../../binary-packet';
import TankModel from '../../../entity/tanks/tank-model';
import BinaryEncoder from "../../../legacy/serialization-v0001/binary/binary-encoder";
import BinaryDecoder from "../../../legacy/serialization-v0001/binary/binary-decoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import {EntityModelType} from "../../../entity/entity-model";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import WriteBuffer from "../../../serialization/binary/write-buffer";

export default class PlayerConfigPacket extends BinaryPacket {
	public nick: string;
	public tank: EntityModelType;

    static typeName = 7

    constructor(nick: string, tank: EntityModelType) {
        super();
        this.nick = nick
        this.tank = tank
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeUint8(this.tank.getId())
        encoder.writeString(this.nick)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let tank = TankModel.Types.get(decoder.readUint8())
        return new PlayerConfigPacket(decoder.readString(), tank) as any as T
    }
}

BinarySerializer.register(PlayerConfigPacket)