
import BinaryPacket from '../../binarypacket';

class PlayerChatPacket extends BinaryPacket {
	public text: any;

    static typeName() { return 8 }

    constructor(text) {
        super();
        this.text = text
    }

    toBinary(encoder) {
        encoder.writeString(this.text)
    }

    static fromBinary(decoder) {
        return new PlayerChatPacket(decoder.readString())
    }
}

BinaryPacket.register(PlayerChatPacket)
export default PlayerChatPacket;