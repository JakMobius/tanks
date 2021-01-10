
import ClientEffect from '../clienteffect';
import EffectModel from 'src/effects/effect-model';
import ClientGameWorld from "../../clientgameworld";

class ClientWorldEffect extends ClientEffect {
    public model: EffectModel;
    public world: ClientGameWorld;

    constructor(model: EffectModel, world: ClientGameWorld) {
        super(model)
        this.model = model
        this.world = world
    }

    static fromModelAndWorld(model: EffectModel, world: ClientGameWorld): ClientEffect | null {
        let clazz = this.Types.get(model.constructor as typeof EffectModel) as unknown as typeof ClientWorldEffect
        if(!clazz) return null
        return new clazz(model, world)
    }
}

export default ClientWorldEffect;