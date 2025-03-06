import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform-component";
import Entity from "src/utils/ecs/entity";
import HealthComponent from "src/entity/components/health-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import DamageReason, { DamageTypes } from "src/server/damage-reason/damage-reason";
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import ChargeWeaponComponent from "src/entity/components/weapon/charge-weapon-component";

export default class WeaponStungun extends ChargeWeaponComponent {
    public damage: number = 1.4;
    public radius: number = 12.5;
    public points: number[][] = [[-1.875, 0.5], [1.875, 0.5]];
    private squareRadius: number = this.damage * this.damage;

    setDamage(damage: number) {
        this.damage = damage
        return this
    }

    setRadius(radius: number) {
        this.radius = radius
        this.squareRadius = this.radius * this.radius
        return this
    }

    tick(dt: number) {
        super.tick(dt)
        if (!this.isFiring) return

        let weaponComponent = this.entity.getComponent(WeaponComponent)
        let tank = weaponComponent.tank

        const transform = tank.getComponent(TransformComponent).getTransform()

        let world = tank.parent

        for (let i = this.points.length - 1; i >= 0; i--) {
            const point = this.points[i];

            const px = transform.transformX(point[0], point[1]);
            const py = transform.transformY(point[0], point[1]);

            for (let each of near(px, py, null, world, this.squareRadius)) {
                if (each != tank) {
                    let damageReason = new DamageReason()
                    damageReason.damageType = DamageTypes.ELECTRICAL
                    damageReason.player = tank.getComponent(ServerEntityPilotComponent).pilot
                    each.getComponent(HealthComponent).damage(this.damage * dt, damageReason)
                }
            }
        }
    }
}

const near = function (x: number, y: number, tplayer: Entity, world: Entity, distance: number): Entity[] {
    const result = [];

    for (let entity of world.children.values()) {

        const physicalComponent = entity.getComponent(PhysicalComponent)

        if (!physicalComponent) {
            continue
        }

        const pos = physicalComponent.getBody().GetPosition();
        const dx = pos.x - x;
        const dy = pos.y - y;

        const dist = dx * dx + dy * dy;

        if (dist < distance) {
            result.push(entity)
        }
    }
    return result
};