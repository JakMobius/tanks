
import GameMap from 'src/map/gamemap';
import AbstractWorld from "../abstract-world";
import ExplodeEffectPool from "../effects/world/explode/explode-effect-pool";

export default class ServerWorldExplodeEffectPool<WorldClass extends AbstractWorld> extends ExplodeEffectPool<WorldClass> {
    // Ну это сколько-то.
    // Домножь на damageEnergyFraction, чтобы прикинуть
    // урон блокам от взрыва

    public blockDamageCoefficient = 20000

    damageBlock(x: number, y: number, damage: number) {
        this.world.map.damageBlock(x / GameMap.BLOCK_SIZE, y / GameMap.BLOCK_SIZE, damage * this.blockDamageCoefficient)
    }
}