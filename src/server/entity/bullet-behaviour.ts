import Entity from "src/utils/ecs/entity";
import PhysicalComponent from "src/entity/components/physics-component";
import HealthComponent from "src/entity/components/health/health-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import DamageReason, { DamageTypes } from "../damage-reason/damage-reason";
import BulletShooterComponent from "src/entity/components/bullet-shooter-component";
import * as Box2D from "@box2d/core";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";
import {WorldComponent} from "src/entity/game-world-entity-prefab";
import TransformComponent from "src/entity/components/transform/transform-component";
import TilemapComponent from "src/map/tilemap-component";
import ExplodeEffectPrefab from "src/entity/types/effect-world-explosion/server-prefab";
import PhysicalHostComponent from "src/entity/components/physical-host-component";

export interface BulletBehaviourConfig {
    diesOnWallHit?: boolean;
    explodePower?: number
    wallDamage?: number
    entityDamage?: number
    lifeTime?: number
}

export default class BulletBehaviour extends EventHandlerComponent {
    worldEventHandler = new BasicEventHandlerSet()
    config: BulletBehaviourConfig

    private lifeTime: number
    private isDead = false;

    constructor(config?: BulletBehaviourConfig) {
        super()
        this.config = Object.assign({
            lifeTime: 5
        }, config)

        this.lifeTime = this.config.lifeTime

        this.eventHandler.on("tick", (dt: number) => {
            if (this.isDead) {
                this.beforeDeath()
                this.entity.removeFromParent()
            } else {
                this.lifeTime -= dt
                if (this.lifeTime <= 0) this.die()
            }
        })

        this.eventHandler.on("entity-hit", (hitEntity: Entity, contact: Box2D.b2Contact) => {
            this.handleEntityHit(hitEntity, contact)
        })

        this.eventHandler.on("block-hit", (x: number, y: number, point: Box2D.XY, tilemap: TilemapComponent) => {
            this.handleBlockHit(x, y, point, tilemap)
        })

        this.eventHandler.on("health-set", (health: number) => {
            if (health == 0 && !this.isDead) this.die()
        })
    }

    private handleEntityHit(hitEntity: Entity, contact: Box2D.b2Contact) {
        if (this.isDead) return
        this.die()

        let contactMidpoint = this.getContactMidpoint(contact)

        this.nextPhysicalTick(() => {
            if (this.config.entityDamage) {
                let healthComponent = hitEntity.getComponent(HealthComponent)
                let damageReason = new DamageReason()
                damageReason.damageType = DamageTypes.IMPACT

                // TODO: Maybe bullet shooter component should handle this by itself?
                // i.e shooter component is not even set on the client side, so this
                // code become useless
                let shooterComponent = this.entity.getComponent(BulletShooterComponent)
                if (shooterComponent) {
                    damageReason.player = shooterComponent.shooter
                }

                if (healthComponent) healthComponent.damage(this.config.entityDamage, damageReason)
            }

            this.stuckAtPoint(contactMidpoint)
        })
    }

    private handleBlockHit(x: number, y: number, point: Box2D.XY, tilemap: TilemapComponent) {
        if (this.isDead) return
        if (this.config.diesOnWallHit !== false) {
            this.die()
        }
        const world = this.entity.parent 

        this.nextPhysicalTick(() => {
            if (this.config.wallDamage) {
                tilemap?.damageBlock(x, y, this.config.wallDamage)
            }

            if (this.config.diesOnWallHit !== false) {
                this.stuckAtPoint(point)
            }
        })
    }

    private nextPhysicalTick(callback: () => void) {
        this.entity.parent.getComponent(PhysicalHostComponent).loop.scheduleTask(callback)
    }

    maybeExplode() {
        if (this.config.explodePower) {
            let position = this.entity.getComponent(PhysicalComponent).getBody().GetPosition()

            let explodeEntity = new Entity()
            ExplodeEffectPrefab.prefab(explodeEntity)
            WorldComponent.getWorld(this.entity).appendChild(explodeEntity)
            explodeEntity.getComponent(ExplodeComponent).explode(position.x, position.y, this.config.explodePower)
            explodeEntity.removeFromParent()
        }
    }

     die() {
        this.isDead = true
    }

    private getContactMidpoint(contact: Box2D.b2Contact) {
        const worldManifold = new Box2D.b2WorldManifold()
        contact.GetWorldManifold(worldManifold)
        const points = worldManifold.points.slice(0, contact.GetManifold().pointCount)

        // In case it's a sensor
        if (points.length === 0) {
            let position = this.entity.getComponent(PhysicalComponent).getBody().GetPosition()
            return {
                x: position.x,
                y: position.y
            }
        }

        const x = points.reduce((sum, point) => sum + point.x, 0) / points.length
        const y = points.reduce((sum, point) => sum + point.y, 0) / points.length
        return {x: x, y: y}
    }

    private stuckAtPoint(point: Box2D.XY) {
        let body = this.entity.getComponent(PhysicalComponent)
        body.setVelocity({x: 0, y: 0})
        body.getBody().SetFixedRotation(true)
        body.getBody().SetEnabled(false)

        this.entity.getComponent(TransformComponent).setGlobal({
            position: point,
            angle: body.getBody().GetAngle()
        })
    }

    private beforeDeath() {
        this.maybeExplode()
    }
}