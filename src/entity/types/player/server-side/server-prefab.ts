import Entity from "src/utils/ecs/entity";
import PlayerSelfDestructionComponent from "src/entity/types/player/server-side/player-self-destruction-component";
import PlayerVisibilityManagerComponent from "src/entity/types/player/server-side/player-visibility-manager-component";
import PlayerVisibilityDecisionComponent
    from "src/entity/types/player/server-side/player-visibility-decision-component";
import PlayerPrimaryEntityTransmitComponent
    from "src/entity/types/player/server-side/player-primary-entity-transmit-component";
import PlayerFlagDropComponent from "src/entity/types/player/server-side/player-flag-drop-component";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import SocketPortalClient from "src/server/socket/socket-portal-client";
import ServerDatabase from "src/server/db/server-database";
import PlayerDataComponent from "src/entity/types/player/server-side/player-data-component";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";
import PlayerTeamComponent from "src/entity/types/player/server-side/player-team-component";
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";
import PlayerTankControlComponent from "src/entity/types/player/server-side/player-tank-control-component";

export interface ServerPlayerEntityPrefabConfig {
    client: SocketPortalClient
    db: ServerDatabase
    nick: string
}

export function serverPlayerEntityPrefab(entity: Entity, config: ServerPlayerEntityPrefabConfig) {
    entity.addComponent(new PlayerDataComponent(config.db))
    entity.addComponent(new PlayerConnectionManagerComponent(config.client))
    entity.addComponent(new PlayerNickComponent(config.nick))
    entity.addComponent(new PlayerWorldComponent())
    entity.addComponent(new PlayerTankComponent())
    entity.addComponent(new PlayerTeamComponent())
    entity.addComponent(new PlayerSelfDestructionComponent())
    entity.addComponent(new PlayerFlagDropComponent())
    entity.addComponent(new PlayerRespawnActionComponent())
    entity.addComponent(new PlayerPrimaryEntityTransmitComponent())
    entity.addComponent(new PlayerVisibilityManagerComponent())
    entity.addComponent(new PlayerVisibilityDecisionComponent())
    entity.addComponent(new PlayerTankControlComponent())
}