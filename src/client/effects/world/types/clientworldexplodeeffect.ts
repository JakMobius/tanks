
import ClientWorldEffect from '../clientworldeffect';
import WorldExplodeEffectModel from 'src/effects/world/explode/world-explode-effect-model';
import ClientGameWorld from "../../../clientgameworld";

class ClientWorldExplodeEffect extends ClientWorldEffect {
	public die: any;
	public model: WorldExplodeEffectModel

	static Model = WorldExplodeEffectModel

    constructor(model: WorldExplodeEffectModel, world: ClientGameWorld) {
        super(model, world);
        this.model = model
    }

    tick(dt: number) {
        this.world.explosionEffectPool.start(this.model.x, this.model.y, this.model.power)

        this.die()
    }
}

export default ClientWorldExplodeEffect;