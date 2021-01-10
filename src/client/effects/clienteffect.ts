
import AbstractEffect from 'src/effects/abstract-effect';
import EffectModel from "../../effects/effect-model";

class ClientEffect extends AbstractEffect {

    public static Model: typeof EffectModel

    constructor(model: EffectModel) {
        super(model);
    }
}

export default ClientEffect;