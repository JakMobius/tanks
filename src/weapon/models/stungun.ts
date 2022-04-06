import Weapon, {WeaponConfig} from '../weapon';
import AbstractPlayer from "../../abstract-player";
import ServerGameWorld from "../../server/server-game-world";
import ServerEntity from "../../server/entity/server-entity";
import PhysicalComponent from "../../entity/physics-component";
import TransformComponent from "../../entity/transform-component";

export interface WeaponStungunConfig extends WeaponConfig {
    damage: number
    radius: number
}

export default class WeaponStungun extends Weapon {
	public damage: number;
	public radius: number;
	public squareRadius: number;
	public points: number[][];

    constructor(config: WeaponStungunConfig) {
        super(config)
        this.damage = config.damage || 1.4 // Для каждой точки (то есть если точки две, то суммарный урон в два раза больше)
        this.radius = config.radius || 12.5
        this.squareRadius = this.radius ** 2
        this.points = [[-1.875, 0.5], [1.875, 0.5]]
    }

    ready() {
        return true
    }

    tick(dt: number) {
        super.tick(dt)
        if(!this.engaged) return

        const transform = this.tank.model.getComponent(TransformComponent).transform

        let tank = this.tank
        let player = tank.player
        let game = player.getWorld()

        for (let i = this.points.length - 1; i >= 0; i--) {
            const point = this.points[i];

            const px = transform.transformX(point[0], point[1]);
            const py = transform.transformY(point[0], point[1]);

            for(let each of near(px, py, player, game, this.squareRadius)) {
                each.damage(this.damage * dt)
            }
        }
    }
}

const near = function (x: number, y: number, tplayer: AbstractPlayer, world: ServerGameWorld, distance: number): ServerEntity[] {
    const result = [];
    for (let entity of world.entities.values()) {

        if (entity.model.id === tplayer.id) continue

        const pos = entity.model.getComponent(PhysicalComponent).getBody().GetPosition();
        const dx = pos.x - x;
        const dy = pos.y - y;

        const dist = dx * dx + dy * dy;

        if (dist < distance) {
            result.push(entity)
        }
    }
    return result
};