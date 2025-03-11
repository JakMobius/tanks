import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import HealthComponent from "src/entity/components/health/health-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import DamageReason, { DamageTypes } from "src/server/damage-reason/damage-reason";
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import ChargeWeaponComponent from "src/entity/components/weapon/charge-weapon-component";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import Entity from "src/utils/ecs/entity";
import {EntityType} from "src/entity/entity-type";
import FlameEffectComponent from "src/entity/types/effect-flame/flame-effect-component";

export default class WeaponFlamethrower extends ChargeWeaponComponent {
    public damage: number = 3;
    public radius: number = 30;
    public angle: number = Math.PI / 3;
    public squareRadius: number = this.radius * this.radius;
    public flameEffect: Entity | null = null

    constructor() {
        super();

        this.flameEffect = new Entity()
        ServerEntityPrefabs.types.get(EntityType.EFFECT_FLAME)(this.flameEffect)

        this.eventHandler.on("tank-set", (tank: Entity) => {
            this.flameEffect.removeFromParent()
            tank?.appendChild(this.flameEffect)
        })
    }

    setDamage(damage: number) {
        this.damage = damage
        return this
    }

    setRadius(radius: number) {
        this.radius = radius
        this.squareRadius = this.radius * this.radius
        return this
    }

    setAngle(angle: number) {
        this.angle = angle
        return this
    }

    tick(dt: number) {
        super.tick(dt)

        if (!this.isFiring) return

        const weaponComponent = this.entity.getComponent(WeaponComponent)

        const tank = weaponComponent.tank
        const tankBody = tank.getComponent(PhysicalComponent).getBody()
        const tankLocation = tankBody.GetPosition()
        const tankAngle = tankBody.GetAngle()

        const normalizedAngle = (tankAngle + Math.PI) % (Math.PI * 2) - Math.PI;

        const world = tank.parent

        for (let entity of world.children.values()) {

            const anotherTankPositionComponent = entity.getComponent(TransformComponent)
            const anotherTankHealthComponent = entity.getComponent(HealthComponent)

            if (!anotherTankPositionComponent || !anotherTankHealthComponent) continue
            if (entity === tank) continue

            const anotherTankLocation = anotherTankPositionComponent.getPosition()

            const x = anotherTankLocation.x - tankLocation.x;
            const y = anotherTankLocation.y - tankLocation.y;

            const distSquared = x ** 2 + y ** 2;

            if (distSquared > this.squareRadius) continue

            let angle = Math.atan2(-y, x) + normalizedAngle;

            if (angle > Math.PI) angle -= Math.PI * 2
            if (angle < -Math.PI) angle += Math.PI * 2

            if (Math.abs(angle) >= this.angle / 2) continue

            const damage = (Math.sqrt(1 - distSquared / this.squareRadius)) * this.damage * dt

            const damageReason = new DamageReason()
            const pilotComponent = tank.getComponent(ServerEntityPilotComponent)

            if (pilotComponent) {
                damageReason.player = pilotComponent.pilot
            }

            damageReason.damageType = DamageTypes.FIRE

            anotherTankHealthComponent.damage(damage, damageReason)
        }
    }

    setIsFiring(isFiring: boolean) {
        super.setIsFiring(isFiring);
        const weaponComponent = this.entity?.getComponent(WeaponComponent)
        if (!weaponComponent) return

        this.flameEffect.getComponent(FlameEffectComponent).setFiring(isFiring)
    }
}