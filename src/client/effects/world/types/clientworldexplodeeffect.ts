
import ClientWorldEffect from '../clientworldeffect';
import WorldExplodeEffectModel from '@/effects/world/explode/worldexplodeeffectmodel';

class ClientWorldExplodeEffect extends ClientWorldEffect {
	public die: any;

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

ClientWorldEffect.associate(WorldExplodeEffectModel, ClientWorldExplodeEffect)

export default ClientWorldExplodeEffect;