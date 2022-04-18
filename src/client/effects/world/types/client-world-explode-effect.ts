import ClientWorldEffect from '../client-world-effect';
import WorldExplodeEffectModel from 'src/effects/world/models/world-explode-effect-model';
import ClientGameWorld from "../../../client-game-world";
import ExplodeEffectPool from "../../../../effects/world/explode/explode-effect-pool";

export default class ClientWorldExplodeEffect extends ClientWorldEffect {
	public model: WorldExplodeEffectModel

	static Model = WorldExplodeEffectModel

    constructor(model: WorldExplodeEffectModel, world: ClientGameWorld) {
        super(model, world);
        this.model = model
    }

    tick(dt: number) {
        this.world.getComponent(ExplodeEffectPool).start(this.model.x, this.model.y, this.model.power)

        this.die()
    }
}