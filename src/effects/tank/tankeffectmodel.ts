
import EffectModel from '../effectmodel';

/**
 * @abstract
 */
class TankEffectModel extends EffectModel {

    /**
     * Identifier of the tank holding this effect
     */
    tankId

    static fromBinary(decoder) {
        let model = super.fromBinary(decoder)
        model.tankId = decoder.readUint16()
        return model
    }

    toBinary(encoder) {
        super.toBinary(encoder)
        encoder.writeUint16(this.tankId)
    }
}

export default TankEffectModel;