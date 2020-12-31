
import BinaryPacket from '../../binarypacket';

class EffectRemovePacket extends BinaryPacket {
	public id: any;

    static typeName() {
        return 19
    }

    constructor(id) {
        super();
        this.id = id
    }

    toBinary(encoder) {
        encoder.writeFloat64(this.id)
    }

    static fromBinary(decoder) {
        return new this(decoder.readFloat64())
    }
}

BinaryPacket.register(EffectRemovePacket)
export default EffectRemovePacket;