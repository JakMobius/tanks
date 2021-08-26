
import BinaryPacket from '../../binary-packet';
import TankModel from '../../../entity/tanks/tank-model';
import BinaryEncoder from "../../../serialization/binary/binary-encoder";
import BinaryDecoder from "../../../serialization/binary/binary-decoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";
import {EntityModelType} from "../../../entity/entity-model";

export default class PlayerConfigPacket extends BinaryPacket {
	public nick: string;
	public tank: EntityModelType;

    static typeName = 7

    constructor(nick: string, tank: EntityModelType) {
        super();
        this.nick = nick
        this.tank = tank
    }

    toBinary(encoder: BinaryEncoder) {
        encoder.writeUint8(this.tank.getId())
        encoder.writeString(this.nick)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let tank = TankModel.Types.get(decoder.readUint8())
        return new PlayerConfigPacket(decoder.readString(), tank) as any as T
    }
}

BinarySerializer.register(PlayerConfigPacket)