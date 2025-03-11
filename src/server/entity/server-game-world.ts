import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import ExplodeEffectEntityAffectController from "src/effects/explode/explode-effect-entity-affect-controller";
import Entity from "src/utils/ecs/entity";
import WorldPlayerStatisticsComponent from "src/server/entity/components/world-player-statistics-component";
import DamageRecorderComponent from "src/server/entity/components/damage-recorder-component";
import WorldRespawnComponent from "src/server/room/components/world-respawn-component";
import {GameWorldConfig, gameWorldEntityPrefab} from "src/entity/game-world-entity-prefab";

import "src/map/block-state/type-loader"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import UserMessageTransmitComponent from "src/server/entity/components/user-message-transmit-component";
import TimerEntityPrefab from "src/entity/types/timer/server-prefab";
import ChatEntityPrefab from "src/entity/types/chat/server-prefab";

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
    TimerEntityPrefab.prefab(worldStatisticsTimer)
    entity.appendChild(worldStatisticsTimer)
    entity.getComponent(WorldStatisticsComponent).setMatchLeftTimer(worldStatisticsTimer)

    let chatEntity = new Entity()
    ChatEntityPrefab.prefab(chatEntity)
    entity.appendChild(chatEntity)
}