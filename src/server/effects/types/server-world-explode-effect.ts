
import WorldExplodeEffectModel from 'src/effects/world/models/world-explode-effect-model';
import ExplodeEffectPool from "../../../effects/world/explode/explode-effect-pool";
import ServerEffect from "../server-effect";

export default class ServerWorldExplodeEffect extends ServerEffect {
    static Model = WorldExplodeEffectModel
    public model: WorldExplodeEffectModel

    constructor(model: WorldExplodeEffectModel) {
        super(model);
        this.model = model
    }

    tick(dt: number) {
        this.host.entity.getComponent(ExplodeEffectPool).start(this.model.x, this.model.y, this.model.power)

        this.die()
    }
}