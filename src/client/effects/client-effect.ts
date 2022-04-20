import AbstractEffect from 'src/effects/abstract-effect';
import EffectModel from "../../effects/effect-model";
import EffectHost from "../../effects/effect-host";

export default class ClientEffect extends AbstractEffect {

    public static Model: typeof EffectModel
    static Types = new Map<typeof EffectModel, typeof ClientEffect>()

    constructor(model: EffectModel) {
        super(model);
    }

    static associate(modelClass: typeof EffectModel, effectClass: typeof ClientEffect): void {
        this.Types.set(modelClass, effectClass)
    }

    static fromModel(model: EffectModel): ClientEffect | null {
        let clazz = this.Types.get(model.constructor as typeof EffectModel)
        if(!clazz) return null
        return new clazz(model)
    }
}