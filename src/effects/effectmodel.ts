
import BinarySerializable from '../serialization/binary/serializable';

/**
 * @abstract
 * This class represents an effect model, which contains all necessary
 * data to create an side-specific effect class instance
 */
class EffectModel extends BinarySerializable {

    /**
     * @private
     * @type {number}
     */
    static globalId = 0

    /**
     * Unique effect identifier
     */
    id

    /**
     * @param {Object?} [options]
     * @param {number} [options.id]
     */
    constructor(options?: any) {
        super();
        if(options) {
            if (options.id === undefined) {
                this.id = EffectModel.globalId++
            } else {
                this.id = options.id
            }
        }
    }

    static groupName() {
        return 2
    }

    toBinary(encoder) {
        encoder.writeFloat64(this.id)
    }

    static fromBinary(decoder) {
        return new this({
            id : decoder.readFloat64()
        })
    }
}

export default EffectModel;