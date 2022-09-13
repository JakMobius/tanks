import AbstractEffect from 'src/effects/abstract-effect';
import EffectModel from "src/effects/effect-model";
import {Constructor} from "src/serialization/binary/serializable";

export default class ServerEffect extends AbstractEffect {
    static Model: Constructor<EffectModel>

    static Types = new Map<typeof EffectModel, typeof ServerEffect>()

    static associate(modelClass: typeof EffectModel, effectClass: typeof ServerEffect): void {
        this.Types.set(modelClass, effectClass)
    }

    static fromModel(model: EffectModel): ServerEffect | null {
        let clazz = this.Types.get(model.constructor as typeof EffectModel)
        if(!clazz) return null
        return new clazz(model)
    }
}