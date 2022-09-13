import ExplodeEffectPool from "../effects/explode/explode-effect-pool";
import ExplodeEffectEntityAffectController from "../effects/explode/explode-effect-entity-affect-controller";
import Entity from "../utils/ecs/entity";
import ServerEntityPrefabs from "./entity/server-entity-prefabs";
import {EntityType} from "../entity/entity-type";
import WorldPlayerStatisticsComponent from "./entity/components/world-player-statistics-component";
import DamageRecorderComponent from "./entity/components/damage-recorder-component";
import WorldRespawnComponent from "./room/components/world-respawn-component";
import {GameWorldConfig, gameWorldEntityPrefab} from "../game-world-entity-prefab";

import "src/server/entity/prefab-loader"
import "src/server/effects/type-loader"
import "src/entity/prefab-loader"
import "src/effects/model-loader"
import "src/map/block-state/type-loader"
import EntityDataTransmitComponent from "../entity/components/network/transmitting/entity-data-transmit-component";
import ServerWorldPlayerManagerComponent from "./entity/components/server-world-player-manager-component";
import WorldStatisticsComponent from "../entity/components/network/world-statistics/world-statistics-component";

export function serverGameWorldEntityPrefab(entity: Entity, options: GameWorldConfig) {

    gameWorldEntityPrefab(entity, options)

    entity.addComponent(new ServerWorldPlayerManagerComponent())
    entity.addComponent(new EntityDataTransmitComponent())
    entity.addComponent(new ExplodeEffectPool({
        damageBlocks: true
    }))

    entity.addComponent(new ExplodeEffectEntityAffectController({
        damageEntities: true
    }))

    entity.addComponent(new DamageRecorderComponent())
    entity.addComponent(new WorldPlayerStatisticsComponent())
    entity.addComponent(new WorldRespawnComponent())

    // TODO: Maybe move this somewhere from world prefab
    let worldStatisticsTimer = new Entity()
    ServerEntityPrefabs.types.get(EntityType.TIMER_ENTITY)(worldStatisticsTimer)
    entity.appendChild(worldStatisticsTimer)
    entity.getComponent(WorldStatisticsComponent).setMatchLeftTimer(worldStatisticsTimer)
}