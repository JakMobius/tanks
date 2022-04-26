import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import EntityModel from "../../entity/entity-model";
import * as Box2D from "../../library/box2d";
import PhysicalComponent from "../../entity/components/physics-component";
import WorldExplodeEffectModel from "../../effects/world/models/world-explode-effect-model";
import EffectHost from "../../effects/effect-host";
import ServerEffect from "../effects/server-effect";
import HealthComponent from "../../entity/components/health-component";
import TilemapComponent from "../../physics/tilemap-component";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";

export interface BulletBehaviourConfig {
    diesOnWallHit?: boolean;
    explodePower?: number
    wallDamage?: number
    entityDamage?: number
    lifeTime?: number
    initialVelocity?: number
}

export default class BulletBehaviour implements Component {
    entity: EntityModel
    eventHandler = new BasicEventHandlerSet()
    config: BulletBehaviourConfig

    private lifeTime: number

    constructor(config: BulletBehaviourConfig) {
        this.config = Object.assign({
            lifeTime: 5,
            initialVelocity: 0
        }, config)

        this.lifeTime = this.config.lifeTime

        this.eventHandler.on("tick", (dt: number) => {
            if(this.entity.isDead()) return;
            this.lifeTime -= dt
            if(this.lifeTime <= 0) this.trigger()
        })

        this.eventHandler.on("bullet-launch", () => this.onLaunch())

        this.eventHandler.on("entity-hit", (hitEntity: EntityModel) => {
            if(this.entity.isDead()) return;
            this.handleEntityHit(hitEntity)
        })

        this.eventHandler.on("block-hit", (x: number, y: number, point: Box2D.Vec2) => {
            if(this.entity.isDead()) return;
            this.handleBlockHit(x, y)
        })
    }

    private handleEntityHit(hitEntity: Entity) {
        const world = this.entity.parent

        if(this.config.entityDamage) {
            world.physicsLoop.scheduleTask(() => {
                let healthComponent = hitEntity.getComponent(HealthComponent)
                if (healthComponent) healthComponent.damage(this.config.entityDamage)
            })
        }

        this.trigger()
    }

    private handleBlockHit(x: number, y: number) {
        const world = this.entity.parent

        if(this.config.wallDamage) {
            world.physicsLoop.scheduleTask(() => {
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

            world.getComponent(EffectHost).addEffect(ServerEffect.fromModel(effect))
        }
        this.entity.die();
    }

    ignoreCollisions(entity: Entity) {
        this.eventHandler.on("should-collide", (body: Box2D.Body) => {
            return body.GetUserData() !== entity
        })
    }

    onAttach(entity: EntityModel): void {
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