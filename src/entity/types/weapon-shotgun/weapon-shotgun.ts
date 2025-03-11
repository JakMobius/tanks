import FirearmWeaponComponent from "src/entity/components/weapon/firearm-weapon-component";
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";
import PhysicalComponent from "src/entity/components/physics-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import HealthComponent from "src/entity/components/health/health-component";
import DamageReason, { DamageTypes } from "src/server/damage-reason/damage-reason";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import * as Box2D from "@box2d/core";
import Entity from "src/utils/ecs/entity";
import PelletsEffectComponent from "src/entity/types/effect-pellets/pellets-effect-component";
import PelletsEffectPrefab from "src/entity/types/effect-pellets/server-prefab";

export default class WeaponShotgun extends FirearmWeaponComponent {

    public damage: number = 6;
    public radiusMin: number = 5;
    public radiusMax: number = 15;
    public spreadAngleCos: number = Math.cos(Math.PI / 2);
    public shootImpulse: number = 30000
    public pelletsEffect: Entity | null = null
    public weaponAngle: number = 0

    constructor() {
        super();

        this.pelletsEffect = new Entity()
        PelletsEffectPrefab.prefab(this.pelletsEffect)

        this.eventHandler.on("tank-set", (tank: Entity) => {
            this.pelletsEffect.removeFromParent()
            tank?.appendChild(this.pelletsEffect)
        })
    }

    setDamage(damage: number) {
        this.damage = damage
        return this
    }

    setRadius(radius: number) {
        this.radiusMin = radius
        return this
    }

    setSpreadAngle(angle: number) {
        this.spreadAngleCos = Math.cos(angle / 2)
        return this
    }

    setWeaponAngle(angle: number) {
        this.weaponAngle = angle
        return this
    }

    shoot() {
        super.shoot()
        let weaponSin = Math.sin(this.weaponAngle)
        let weaponCos = Math.cos(this.weaponAngle)

        const weaponComponent = this.entity.getComponent(WeaponComponent)

        const tank = weaponComponent.tank
        const tankTransform = tank.getComponent(TransformComponent)
        const tankBody = tank.getComponent(PhysicalComponent).getBody()
        const tankLocation = tankTransform.getPosition()

        const weaponDirection = tankTransform.getDirection()
        Box2D.b2Vec2.prototype.RotateCosSin.call(weaponDirection, weaponCos, weaponSin)
        Box2D.b2Vec2.prototype.Normalize.call(weaponDirection)
        const world = tank.parent

        const impulseVector = { x: weaponDirection.x * this.shootImpulse, y: weaponDirection.y * this.shootImpulse }
        tankBody.ApplyLinearImpulseToCenter(impulseVector)

        let distanceVector = new Box2D.b2Vec2()

        for (let entity of world.children.values()) {

            const entityPositionComponent = entity.getComponent(TransformComponent)
            const entityHealthComponent = entity.getComponent(HealthComponent)
            const entityPhysicalComponent = entity.getComponent(PhysicalComponent)

            if (!entityPositionComponent || !entityHealthComponent) continue
            if (entity === tank) continue

            const entityLocation = entityPositionComponent.getPosition()
            distanceVector.x = entityLocation.x - tankLocation.x
            distanceVector.y = entityLocation.y - tankLocation.y

            const length = distanceVector.Normalize()
            const directionDot = -distanceVector.Dot(weaponDirection)

            const lengthCoef = Math.min(1, 1 - (length - this.radiusMin) / this.radiusMax)
            const spreadCoef = (directionDot - this.spreadAngleCos) / (1 - this.spreadAngleCos)

            if (lengthCoef <= 0 || spreadCoef <= 0) continue

            const impactSeverity = lengthCoef * spreadCoef

            const damage = this.damage * impactSeverity
            const damageReason = new DamageReason()
            damageReason.player = tank.getComponent(ServerEntityPilotComponent)?.pilot
            damageReason.damageType = DamageTypes.IMPACT
            entityHealthComponent.damage(damage, damageReason)

            let forceVector = distanceVector.Clone().Scale(this.shootImpulse * impactSeverity)
            entityPhysicalComponent.body.ApplyLinearImpulse(forceVector, tankLocation)
        }

        this.popBullet()

        this.pelletsEffect.getComponent(PelletsEffectComponent).trigger()
    }
}