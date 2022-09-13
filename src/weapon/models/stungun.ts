import Weapon, {WeaponConfig} from '../weapon';
import Player from "src/server/player";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform-component";
import Entity from "src/utils/ecs/entity";
import HealthComponent, {DamageTypes} from "src/entity/components/health-component";
import ServerEntityPilotListComponent from "src/server/entity/components/server-entity-pilot-list-component";
import DamageReason from "src/server/damage-reason/damage-reason";

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
        this.damage = config.damage || 1.4
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

        const transform = this.tank.getComponent(TransformComponent).transform

        let tank = this.tank
        // let player = tank.player
        let world = tank.parent

        for (let i = this.points.length - 1; i >= 0; i--) {
            const point = this.points[i];

            const px = transform.transformX(point[0], point[1]);
            const py = transform.transformY(point[0], point[1]);

            for(let each of near(px, py, null, world, this.squareRadius)) {
                if(each != this.tank) {
                    let damageReason = new DamageReason()
                    damageReason.damageType = DamageTypes.ELECTRICAL
                    damageReason.players = tank.getComponent(ServerEntityPilotListComponent).players
                    each.getComponent(HealthComponent).damage(this.damage * dt, damageReason)
                }
            }
        }
    }
}

const near = function (x: number, y: number, tplayer: Player, world: Entity, distance: number): Entity[] {
    const result = [];

    for (let entity of world.children.values()) {

        const pos = entity.getComponent(PhysicalComponent).getBody().GetPosition();
        const dx = pos.x - x;
        const dy = pos.y - y;

        const dist = dx * dx + dy * dy;

        if (dist < distance) {
            result.push(entity)
        }
    }
    return result
};