
import ServerWorldEffect from '../../serverworldeffect';
import WorldExplodeEffectModel from 'src/effects/world/explode/world-explode-effect-model';
import ServerGameWorld from "../../../../servergameworld";

class ServerWorldExplodeEffect extends ServerWorldEffect {
	public die: any;
    static shouldSynchroniseRemoval = false
    public model: WorldExplodeEffectModel

    constructor(model: WorldExplodeEffectModel, world: ServerGameWorld) {
        super(model, world);
        this.model = model
    }

    tick(dt: number) {
        this.world.explosionEffectPool.start(this.model.x, this.model.y, this.model.power)

        this.die()
    }
}
export default ServerWorldExplodeEffect;