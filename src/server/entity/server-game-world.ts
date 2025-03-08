import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import ExplodeEffectEntityAffectController from "src/effects/explode/explode-effect-entity-affect-controller";
import Entity from "src/utils/ecs/entity";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import WorldPlayerStatisticsComponent from "src/server/entity/components/world-player-statistics-component";
import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import WorldRespawnComponent from "src/server/room/components/world-respawn-component";
import {GameWorldConfig, gameWorldEntityPrefab} from "src/entity/game-world-entity-prefab";

import "src/entity/server-prefab-loader"
import "src/entity/prefab-loader"
import "src/map/block-state/type-loader"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import UserMessageTransmitComponent from "src/server/entity/components/user-message-transmit-component";

export function serverGameWorldEntityPrefab(entity: Entity, options?: GameWorldConfig) {

    gameWorldEntityPrefab(entity, options)

    entity.addComponent(new ServerWorldPlayerManagerComponent())
    entity.addComponent(new EntityDataTransmitComponent())

    entity.addComponent(new ExplodeEffectEntityAffectController({
        damageEntities: true
    }))

    entity.addComponent(new DamageRecorderComponent())
    entity.addComponent(new WorldPlayerStatisticsComponent())
    entity.addComponent(new WorldRespawnComponent())
    entity.addComponent(new UserMessageTransmitComponent())

    entity.addComponent(new ExplodeEffectPool({
        damageBlocks: false
    }))

    // TODO: Maybe move this somewhere from world prefab
    let worldStatisticsTimer = new Entity()
    ServerEntityPrefabs.types.get(EntityType.TIMER_ENTITY)(worldStatisticsTimer)
    entity.appendChild(worldStatisticsTimer)
    entity.getComponent(WorldStatisticsComponent).setMatchLeftTimer(worldStatisticsTimer)

    let chatEntity = new Entity()
    ServerEntityPrefabs.types.get(EntityType.CHAT_ENTITY)(chatEntity)
    entity.appendChild(chatEntity)
}