
import WorldExplodeEffectModelPool, {WorldExplodeEffectModelConfig} from 'src/effects/world/explode/world-explode-effect-model';
import GameMap from 'src/utils/map/gamemap';

class ServerWorldExplodeEffectModelPool extends WorldExplodeEffectModelPool {
	public blockDamageCoefficient: any;
	public world: any;

    constructor(config: WorldExplodeEffectModelConfig) {
        super(config);
        // Ну это сколько-то.
        // Домножь на damageEnergyFraction, чтобы прикинуть
        // урон блокам от взрыва
        this.blockDamageCoefficient = 20000
    }

    damageBlock(x: number, y: number, damage: number) {
        this.world.map.damageBlock(x / GameMap.BLOCK_SIZE, y / GameMap.BLOCK_SIZE, damage * this.blockDamageCoefficient)
    }
}

export default ServerWorldExplodeEffectModelPool;