
import BinaryPacket from '../../binarypacket';
import TankModel from '../../../tanks/tankmodel';
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import {Abs} from "../../../library/box2d";
import AbstractTank from "../../../tanks/abstracttank";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";
import {BinarySerializer, Constructor} from "../../../serialization/binary/serializable";

class PlayerConfigPacket extends BinaryPacket {
	public nick: string;
	public tank: typeof TankModel;

    static typeName = 7

    constructor(nick: string, tank: typeof TankModel) {
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
export default PlayerConfigPacket;