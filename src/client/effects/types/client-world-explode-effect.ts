
import WorldExplodeEffectModel from 'src/effects/models/world-explode-effect-model';
import ExplodeEffectPool from "../../../effects/explode/explode-effect-pool";
import ClientEffect from "../client-effect";

export default class ClientWorldExplodeEffect extends ClientEffect {
	public model: WorldExplodeEffectModel

	static Model = WorldExplodeEffectModel

    constructor(model: WorldExplodeEffectModel) {
        super(model);
        this.model = model
    }

    tick(dt: number) {
        let entity = this.host.entity
        entity.getComponent(ExplodeEffectPool).start(this.model.x, this.model.y, this.model.power)

        this.die()
    }
}