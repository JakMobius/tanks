
import BinaryPacket from '../../binarypacket';
import EffectModel from '@/effects/effectmodel';

class EffectCreatePacket extends BinaryPacket {
	public effect: any;

    static typeName() {
        return 14
    }

    /**
     * @param {EffectModel} effect
     */
    constructor(effect) {
        super()

        this.effect = effect
    }

    toBinary(encoder) {
        EffectModel.serialize(this.effect, encoder)
    }

    static fromBinary(decoder) {
        const effect = EffectModel.deserialize(decoder, EffectModel)

        return new this(effect)
    }
}

BinaryPacket.register(EffectCreatePacket)
export default EffectCreatePacket;