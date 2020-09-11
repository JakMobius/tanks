
const GameWorld = require("../gameworld")
const ServerWorldExplodeEffectModelPool = require("./effects/world/types/serverworldexplodeeffect/serverworldexplodeeffectmodelpool")

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

module.exports = ServerGameWorld