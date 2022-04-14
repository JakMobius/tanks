
import EffectModel, { EffectModelConfig } from '../effect-model';
import { Constructor } from 'src/serialization/binary/serializable';
import WriteBuffer from "../../serialization/binary/write-buffer";
import ReadBuffer from "../../serialization/binary/read-buffer";

export interface WorldEffectModelConfig extends EffectModelConfig {
    x: number
    y: number
}

class WorldEffectModel extends EffectModel {

    x: number
    y: number

    /**
     * @param {Object} options
     * @param {number} options.x
     * @param {number} options.y
     */
    constructor(options: WorldEffectModelConfig) {
        super(options)
        this.x = options.x
        this.y = options.y
    }

    toBinary(encoder: WriteBuffer) {
        super.toBinary(encoder)
        encoder.writeFloat32(this.x)
        encoder.writeFloat32(this.y)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let model: WorldEffectModel = super.fromBinary(decoder) as WorldEffectModel

        model.x = decoder.readFloat32()
        model.y = decoder.readFloat32()

        return model as any as T
    }
}

export default WorldEffectModel;