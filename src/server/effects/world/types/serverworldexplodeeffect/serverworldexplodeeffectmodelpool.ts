
import WorldExplodeEffectModelPool from '@/effects/world/explode/worldexplodeeffectmodelpool';
import GameMap from '@/utils/map/gamemap';

class ServerWorldExplodeEffectModelPool extends WorldExplodeEffectModelPool {
	public blockDamageCoefficient: any;
	public world: any;

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

export default ServerWorldExplodeEffectModelPool;