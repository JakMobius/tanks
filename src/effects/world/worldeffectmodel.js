
const EffectModel = require("../effectmodel")

/**
 * @abstract
 */
class WorldEffectModel extends EffectModel {

    /**
     * @type Number
     */
    x

    /**
     * @type Number
     */
    y

    /**
     * @param {Object} options
     * @param {number} options.x
     * @param {number} options.y
     */
    constructor(options) {
        super(options)
        this.x = options.x
        this.y = options.y
    }

    toBinary(encoder) {
        super.toBinary(encoder)
        encoder.writeFloat32(this.x)
        encoder.writeFloat32(this.y)
    }

    static fromBinary(decoder) {
        let model = super.fromBinary(decoder)
        model.x = decoder.readFloat32()
        model.y = decoder.readFloat32()
        return model
    }
}

module.exports = WorldEffectModel