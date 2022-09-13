import WorldEffectModel, {WorldEffectModelConfig} from './world-effect-model';
import {Constructor} from "../../serialization/binary/serializable";
import ReadBuffer from "../../serialization/binary/read-buffer";
import WriteBuffer from "../../serialization/binary/write-buffer";
import EffectModel from "../effect-model";

export interface WorldExplodeEffectModelConfig extends WorldEffectModelConfig {
    x: number
    y: number
    power: number
}

export default class WorldExplodeEffectModel extends WorldEffectModel {
    static typeName = 3

    power = 4

    constructor(options: WorldExplodeEffectModelConfig) {
        super(options)

        if(options.power) this.power = options.power
    }

    toBinary(encoder: WriteBuffer) {
        super.toBinary(encoder)
        encoder.writeFloat32(this.power)
    }

    static fromBinary<T>(this: Constructor<T>, decoder: ReadBuffer): T {
        let effect = super.fromBinary(decoder) as WorldExplodeEffectModel
        effect.power = decoder.readFloat32()
        return effect as any as T
    }
}

EffectModel.register(WorldExplodeEffectModel)