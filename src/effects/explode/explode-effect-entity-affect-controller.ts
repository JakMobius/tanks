import PhysicalComponent from "../../entity/components/physics-component";
import GameMap from "../../map/game-map";
import * as Box2D from "../../library/box2d";
import HealthComponent, {DamageTypes} from "../../entity/components/health-component";
import ExplodeEffectPool from "./explode-effect-pool";
import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import SailingComponent from "../../entity/components/sailing-component";
import DamageReason from "../../server/damage-reason/damage-reason";

export interface ExplodeEffectEntityAffectControllerConfig {
    damageEntities?: boolean
}

export default class ExplodeEffectEntityAffectController implements Component {
    entity: Entity | null;

    damageEntities = false
    private eventHandler = new BasicEventHandlerSet()

    constructor(config?: ExplodeEffectEntityAffectControllerConfig) {
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

        let gradient = new Box2D.Vec2()

        for(let entity of this.entity.children) {
            let physicalComponent = entity.getComponent(PhysicalComponent)
            if(!physicalComponent) continue

            let position = physicalComponent.getBody().GetPosition()

            this.getPressureGradient(pool, position, gradient)
            this.handleEntityAirImpulse(entity, gradient)
        }
    }

    private handleEntityAirImpulse(entity: Entity, impulse: Box2D.Vec2) {
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

        if(this.damageEntities) {
            if (power <= 0) return;

            let healthComponent = entity.getComponent(HealthComponent)
            let damageReason = new DamageReason()
            // TODO: Figure out how to get the shooter
            damageReason.damageType = DamageTypes.EXPLOSION
            if (healthComponent) healthComponent.damage(power, damageReason)
        }
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}