
const ServerWorldEffect = require("../../serverworldeffect")
const WorldExplodeEffectModel = require("/src/effects/world/explode/worldexplodeeffectmodel")

class ServerWorldExplodeEffect extends ServerWorldEffect {
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
module.exports = ServerWorldExplodeEffect