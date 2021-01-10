
import WorldEffectModel, {WorldEffectModelConfig} from '../world-effect-model';
import {Constructor} from "../../../serialization/binary/serializable";
import BinaryEncoder from "../../../serialization/binary/binaryencoder";
import BinaryDecoder from "../../../serialization/binary/binarydecoder";

export interface WorldExplodeEffectModelConfig extends WorldEffectModelConfig {
    x: number
    y: number
    power: number
}

class WorldExplodeEffectModel extends WorldEffectModel {
    static typeName = 2

    /**
     * Explode power
     */
    power = 4

    /**
     * @param {Object} options
     * @param {number} options.x
     * @param {number} options.y
     * @param {number} [options.power]
     */
    constructor(options: WorldExplodeEffectModelConfig) {
        super(options)

        if(options.power) this.power = options.power
    }

    toBinary(encoder: BinaryEncoder) {
        super.toBinary(encoder)
        encoder.writeFloat32(this.power)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T {
        let effect = super.fromBinary(decoder) as WorldExplodeEffectModel
        effect.power = decoder.readFloat32()
        return effect as any as T
    }
}

export default WorldExplodeEffectModel;