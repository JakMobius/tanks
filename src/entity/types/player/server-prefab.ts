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
import { EntityPrefab } from "src/entity/entity-prefabs";
import PrefabComponent from "src/entity/components/prefab-id-component";

export interface ServerPlayerEntityPrefabConfig {
    client: SocketPortalClient
    db: ServerDatabase
    nick: string
}

const Prefab = new EntityPrefab({
    id: "PLAYER",
    metadata: {
        displayName: "Игрок",
    },
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new PlayerDataComponent())
        entity.addComponent(new PlayerConnectionManagerComponent())
        entity.addComponent(new PlayerNickComponent())
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
})

export default Prefab;