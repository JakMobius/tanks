
import ServerWorldEffect from '../../serverworldeffect';
import WorldExplodeEffectModel from '@/effects/world/explode/worldexplodeeffectmodel';

class ServerWorldExplodeEffect extends ServerWorldEffect {
	public die: any;
    static shouldSynchroniseRemoval = false

    constructor(model, world) {
        super(model, world);
        this.model = model
    }

    /**
     * @type {WorldExplodeEffectModel}
     */
    model

    tick(dt) {
        this.world.explosionEffectPool.start(this.model.x, this.model.y, this.model.power)

        this.die()
    }

}

ServerWorldEffect.associate(WorldExplodeEffectModel, ServerWorldExplodeEffect)
export default ServerWorldExplodeEffect;