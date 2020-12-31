
import BinaryPacket from '../../binarypacket';
import TankModel from '../../../tanks/tankmodel';

class PlayerConfigPacket extends BinaryPacket {
	public nick: any;
	public tank: any;

    static typeName() { return 7 }

    constructor(nick, tank) {
        super();
        this.nick = nick
        this.tank = tank
    }

    toBinary(encoder) {
        encoder.writeUint8(this.tank.getId())
        encoder.writeString(this.nick)
    }

    static fromBinary(decoder) {
        let tank = TankModel.Types.get(decoder.readUint8())
        return new PlayerConfigPacket(decoder.readString(), tank)
    }
}

BinaryPacket.register(PlayerConfigPacket)
export default PlayerConfigPacket;