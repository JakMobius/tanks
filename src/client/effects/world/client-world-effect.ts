
import ClientEffect from '../client-effect';
import EffectModel from 'src/effects/effect-model';
import ClientGameWorld from "../../client-game-world";

export default class ClientWorldEffect extends ClientEffect {
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