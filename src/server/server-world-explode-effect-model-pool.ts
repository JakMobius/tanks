
import GameMap from 'src/map/game-map';
import AbstractWorld from "../abstract-world";
import ExplodeEffectPool from "../effects/world/explode/explode-effect-pool";
import TilemapComponent from "../physics/tilemap-component";

export default class ServerWorldExplodeEffectPool extends ExplodeEffectPool {
    // Ну это сколько-то.
    // Домножь на damageEnergyFraction, чтобы прикинуть
    // урон блокам от взрыва

    public blockDamageCoefficient = 20000

    damageBlock(x: number, y: number, damage: number) {
        const map = this.entity.getComponent(TilemapComponent).map
        map.damageBlock(x / GameMap.BLOCK_SIZE, y / GameMap.BLOCK_SIZE, damage * this.blockDamageCoefficient)
    }
}