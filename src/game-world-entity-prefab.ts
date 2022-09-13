import GameMap from 'src/map/game-map';
import AdapterLoop from "./utils/loop/adapter-loop";
import ChunkedMapCollider from "./physics/chunked-map-collider";
import Entity from "./utils/ecs/entity";
import PhysicalHostComponent from "./physiсal-world-component";
import TilemapComponent from "./physics/tilemap-component";
import EffectHostComponent from "./effects/effect-host-component";
import WorldPhysicalLoopComponent from "./entity/components/world-physical-loop-component";
import EntityStateTransmitComponent from "./server/entity/components/entity-state-transmit-component";
import WorldStatisticsComponent from "./entity/components/network/world-statistics/world-statistics-component";

export interface GameWorldConfig {
    physicsTick?: number
    maxTicks?: number
    positionSteps?: number
    velocitySteps?: number
    map?: GameMap
}

export function gameWorldEntityPrefab(entity: Entity, options: GameWorldConfig) {
    options = Object.assign({
        physicsTick: 0.002,
        maxTicks: 30,
        positionSteps: 1,
        velocitySteps: 1
    }, options)

    entity.addComponent(new EntityStateTransmitComponent())
    entity.addComponent(new EffectHostComponent());
    entity.addComponent(new TilemapComponent());
    entity.addComponent(new PhysicalHostComponent({
        physicsTick: options.physicsTick,
        positionSteps: options.positionSteps,
        velocitySteps: options.velocitySteps
    }))
    entity.addComponent(new ChunkedMapCollider());
    entity.getComponent(TilemapComponent).setMap(options.map)
    entity.addComponent(new WorldPhysicalLoopComponent(new AdapterLoop({
        maximumSteps: options.maxTicks,
        interval: options.physicsTick
    })))
    entity.addComponent(new WorldStatisticsComponent())
}