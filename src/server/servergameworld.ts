
import GameWorld from '../gameworld';
import ServerWorldExplodeEffectModelPool from './effects/world/types/serverworldexplodeeffect/serverworldexplodeeffectmodelpool';

class ServerGameWorld extends GameWorld {

    /**
     * @type Game
     */
    room

    constructor(options) {
        super(options);

        this.room = options.room
    }

    createExplosionPool() {
        this.explosionEffectPool = new ServerWorldExplodeEffectModelPool({
            world: this
        })
    }
}

export default ServerGameWorld;