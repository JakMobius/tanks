import AdapterLoop from "src/utils/loop/adapter-loop";
import Entity from "src/utils/ecs/entity";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import WorldPhysicalLoopComponent from "src/entity/components/world-physical-loop-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import ChildTickComponent from "src/entity/components/child-tick-component";
import {Component} from "src/utils/ecs/component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import {EntityType} from "src/entity/entity-type";
import * as Box2D from "@box2d/core"

export interface GameWorldConfig {
    physicsTick?: number
    maxTicks?: number
    iterations?: Box2D.b2StepConfig
}

export class WorldComponent implements Component {
    entity: Entity | null = null

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    static getWorld(entity: Entity) {
        while (entity && !entity.getComponent(WorldComponent)) {
            entity = entity.parent
        }
        return entity
    }
}

export function gameWorldEntityPrefab(entity: Entity, options?: GameWorldConfig) {
    entity.addComponent(new PrefabIdComponent(EntityType.WORLD))
    options = Object.assign({
        physicsTick: 0.002,
        maxTicks: 30,
        iterations: {
            positionIterations: 1,
            velocityIterations: 1
        } as Box2D.b2StepConfig
    }, options)

    entity.addComponent(new WorldComponent())
    entity.addComponent(new EntityStateTransmitComponent())
    entity.addComponent(new PhysicalHostComponent({
        physicsTick: options.physicsTick,
        iterations: options.iterations
    }))
    entity.addComponent(new WorldPhysicalLoopComponent(new AdapterLoop({
        maximumSteps: options.maxTicks,
        interval: options.physicsTick
    })))
    entity.addComponent(new WorldStatisticsComponent())

    // World entities should tick at the very specific time
    // They should do so after physics tick, but before
    // the world communication. This is why world ticks are
    // emitted, not propagated.
    entity.addComponent(new ChildTickComponent())
}