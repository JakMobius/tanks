
import AbstractEffect from 'src/effects/abstract-effect';
import EffectModel from "../../effects/effect-model";

class ServerEffect extends AbstractEffect {
    static shouldSynchroniseRemoval = true

    /**
     * Finds server-side implementation of the effect model
     */
    static fromModel(model: EffectModel): ServerEffect {
        let clazz = this.Types.get(model.constructor as typeof EffectModel)

        if(clazz) return new clazz(model)
        return null
    }
}

export default ServerEffect;