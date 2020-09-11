
const ClientWorldEffect = require("../clientworldeffect")
const WorldExplodeEffectModel = require("/src/effects/world/explode/worldexplodeeffectmodel")

class ClientWorldExplodeEffect extends ClientWorldEffect {

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

module.exports = ClientWorldExplodeEffect