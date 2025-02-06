import PhysicalComponent from "src/entity/components/physics-component";
import GameMap from "src/map/game-map";
import * as Box2D from "@box2d/core";
import HealthComponent from "src/entity/components/health-component";
import ExplodeEffectPool from "./explode-effect-pool";
import Entity from "src/utils/ecs/entity";
import SailingComponent from "src/entity/components/sailing-component";
import DamageReason, { DamageTypes } from "src/server/damage-reason/damage-reason";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export interface ExplodeEffectEntityAffectControllerConfig {
    damageEntities?: boolean
}

export default class ExplodeEffectEntityAffectController extends EventHandlerComponent {

    damageEntities = false
    entityDamageFactor: number = 5.0
    entityDamageThreshold: number = 0.5

    constructor(config?: ExplodeEffectEntityAffectControllerConfig) {
        super()
        config = config || {}
        this.damageEntities = config.damageEntities ?? false
        this.eventHandler.on("explode-pool-tick", (dt) => {
            this.tickEntities(dt)
        })
    }

    private getPressureGradient(pool: ExplodeEffectPool, position: Box2D.XY, target: Box2D.XY) {
        const sourceWalkerPower = pool.poolPressureAt(position.x, position.y)

        target.x = 0
        target.y = 0

        for(let i = 0; i < ExplodeEffectPool.roundOffsetMap.length;) {
            let dx = ExplodeEffectPool.roundOffsetMap[i++]
            let dy = ExplodeEffectPool.roundOffsetMap[i++]
            let skip = false
            let gridX
            let gridY

            for(let distance = pool.gridSize; distance <= pool.pressureDifferentialDistance; distance += GameMap.BLOCK_SIZE) {
                gridX = position.x + dx * distance
                gridY = position.y + dy * distance

                if (pool.isBlock(gridX, gridY)) {
                    skip = true
                    break
                }
            }

            if(skip) continue

            let power = pool.poolPressureAt(gridX, gridY)
            let powerDifference = sourceWalkerPower - power

            target.x += dx * powerDifference
            target.y += dy * powerDifference
        }
    }

    private tickEntities(dt: number): void {
        let pool = this.entity.getComponent(ExplodeEffectPool)

        let gradient = new Box2D.b2Vec2()

        for(let entity of this.entity.children) {
            let physicalComponent = entity.getComponent(PhysicalComponent)
            if(!physicalComponent) continue

            let position = physicalComponent.getBody().GetPosition()

            this.getPressureGradient(pool, position, gradient)
            this.handleEntityAirImpulse(entity, gradient)
            this.handleEntityDamage(pool, entity)
        }
    }

    private handleEntityDamage(pool: ExplodeEffectPool, entity: Entity) {
        if(!this.damageEntities) {
            return
        }

        let position = entity.getComponent(PhysicalComponent).getBody().GetPosition()
        let power = pool.poolPressureAt(position.x, position.y)
        let damage = power * this.entityDamageFactor - this.entityDamageThreshold

        if (damage <= 0) return;

        let healthComponent = entity.getComponent(HealthComponent)
        let damageReason = new DamageReason()
        // TODO: Figure out how to get the shooter
        damageReason.damageType = DamageTypes.EXPLOSION
        if (healthComponent) healthComponent.damage(power, damageReason)
    }

    private handleEntityAirImpulse(entity: Entity, impulse: Box2D.b2Vec2) {
        let power = impulse.Length()
        if(power == 0) return;

        let sailingComponent = entity.getComponent(SailingComponent)
        if(sailingComponent) {
            let sailingFactor = sailingComponent.sailingFactor
            let body = entity.getComponent(PhysicalComponent).getBody()

            body.ApplyLinearImpulseToCenter({
                x: impulse.x * sailingFactor,
                y: impulse.y * sailingFactor
            })
        }
    }
}