import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import PhysicalComponent from "../../entity/components/physics-component";
import WorldExplodeEffectModel from "../../effects/models/world-explode-effect-model";
import EffectHostComponent from "../../effects/effect-host-component";
import ServerEffect from "../effects/server-effect";
import HealthComponent, {DamageTypes} from "../../entity/components/health-component";
import TilemapComponent from "../../physics/tilemap-component";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import DamageReason from "../damage-reason/damage-reason";
import BulletShootersComponent from "../../entity/components/bullet-shooters-component";
import WorldPhysicalLoopComponent from "../../entity/components/world-physical-loop-component";

export interface BulletBehaviourConfig {
    diesOnWallHit?: boolean;
    explodePower?: number
    wallDamage?: number
    entityDamage?: number
    lifeTime?: number
    initialVelocity?: number
}

export default class BulletBehaviour implements Component {
    entity: Entity
    eventHandler = new BasicEventHandlerSet()
    worldEventHandler = new BasicEventHandlerSet()
    config: BulletBehaviourConfig

    private lifeTime: number
    private isDead = false;

    constructor(config: BulletBehaviourConfig) {
        this.config = Object.assign({
            lifeTime: 5,
            initialVelocity: 0
        }, config)

        this.lifeTime = this.config.lifeTime

        this.eventHandler.on("tick", (dt: number) => {
            if(this.isDead) {
                this.entity.removeFromParent()
            } else {
                this.lifeTime -= dt
                if (this.lifeTime <= 0) this.trigger()
            }
        })

        this.eventHandler.on("bullet-launch", () => this.onLaunch())

        this.eventHandler.on("entity-hit", (hitEntity: Entity) => {
            if(this.isDead) return;
            this.handleEntityHit(hitEntity)
        })

        this.eventHandler.on("block-hit", (x: number, y: number) => {
            if(this.isDead) return;
            this.handleBlockHit(x, y)
        })

        this.eventHandler.on("health-set", (health: number) => {
            if(health == 0) this.trigger()
        })
    }

    private handleEntityHit(hitEntity: Entity) {
        const world = this.entity.parent

        if(this.config.entityDamage) {
            world.getComponent(WorldPhysicalLoopComponent).loop.scheduleTask(() => {
                let healthComponent = hitEntity.getComponent(HealthComponent)
                let damageReason = new DamageReason()
                damageReason.damageType = DamageTypes.IMPACT

                // TODO: Maybe bullet shooter component should handle this by itself?
                // i.e shooter component is not even set on the client side, so this
                // code becomes useless
                let shooterComponent = this.entity.getComponent(BulletShootersComponent)
                if(shooterComponent) {
                    damageReason.players = shooterComponent.shooters
                }

                if (healthComponent) healthComponent.damage(this.config.entityDamage, damageReason)
            })
        }

        this.trigger()
    }

    private handleBlockHit(x: number, y: number) {
        const world = this.entity.parent

        if(this.config.wallDamage) {
            world.getComponent(WorldPhysicalLoopComponent).loop.scheduleTask(() => {
                const mapComponent = world.getComponent(TilemapComponent)
                if (mapComponent) {
                    mapComponent.map.damageBlock(x, y, this.config.wallDamage)
                }
            })
        }

        if(this.config.diesOnWallHit !== false) {
            this.trigger()
        }
    }

    private trigger() {
        if(this.config.explodePower) {
            let position = this.entity.getComponent(PhysicalComponent).getBody().GetPosition()
            let effect = new WorldExplodeEffectModel({
                x: position.x,
                y: position.y,
                power: this.config.explodePower
            })
            const world = this.entity.parent

            world.getComponent(EffectHostComponent).addEffect(ServerEffect.fromModel(effect))
        }
        this.die();
    }

    die() {
        this.isDead = true
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(this.entity)
    }

    private onLaunch() {
        let body = this.entity.getComponent(PhysicalComponent).getBody()
        let angle = body.GetAngle()
        body.SetLinearVelocity({
            x: -Math.sin(angle) * this.config.initialVelocity,
            y: Math.cos(angle) * this.config.initialVelocity
        })
    }
}