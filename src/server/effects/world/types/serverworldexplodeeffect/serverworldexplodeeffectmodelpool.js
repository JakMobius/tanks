
const WorldExplodeEffectModelPool = require("/src/effects/world/explode/worldexplodeeffectmodelpool")
const GameMap = require("/src/utils/map/gamemap")

class ServerWorldExplodeEffectModelPool extends WorldExplodeEffectModelPool {

    constructor(config) {
        super(config);
        // Ну это сколько-то.
        // Домножь на damageEnergyFraction, чтобы прикинуть
        // урон блокам от взрыва
        this.blockDamageCoefficient = 20000
    }

    damageBlock(x, y, damage) {
        this.world.map.damageBlock(x / GameMap.BLOCK_SIZE, y / GameMap.BLOCK_SIZE, damage * this.blockDamageCoefficient)
    }
}

module.exports = ServerWorldExplodeEffectModelPool