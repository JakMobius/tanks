import EffectModel from "./effect-model";
import {Constructor} from "../serialization/binary/serializable";

class AbstractEffect {
	public dead: boolean;
    public model: EffectModel
    static Types = new Map<typeof EffectModel, typeof AbstractEffect>()

    constructor(model: EffectModel) {
        this.model = model
        this.dead = false
    }

    tick(dt: number): void {}

    static associate(modelClass: typeof EffectModel, effectClass: typeof AbstractEffect): void {
        this.Types.set(modelClass, effectClass)
    }

    static fromModel(model: EffectModel): AbstractEffect | null {
        let clazz = this.Types.get(model.constructor as typeof EffectModel)
        if(!clazz) return null
        return new clazz(model)
    }

    die(): void {
        this.dead = true
    }
}

export default AbstractEffect;