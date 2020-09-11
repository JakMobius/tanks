
const WorldEffectModel = require("../worldeffectmodel")

class WorldExplodeEffectModel extends WorldEffectModel {
    static typeName() {
        return 2
    }

    /**
     * Explode power
     * @type {number}
     */
    power = 4

    /**
     * @param {Object} options
     * @param {number} options.x
     * @param {number} options.y
     * @param {number} [options.power]
     */
    constructor(options) {
        super(options)

        if(options.power) this.power = options.power
    }

    toBinary(encoder) {
        super.toBinary(encoder)
        encoder.writeFloat32(this.power)
    }

    static fromBinary(decoder) {
        let effect = super.fromBinary(decoder)
        effect.power = decoder.readFloat32()
        return effect
    }
}

WorldEffectModel.register(WorldExplodeEffectModel)
module.exports = WorldExplodeEffectModel