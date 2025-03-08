import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerTDMControllerComponent from "src/entity/types/controller-tdm/server-side/server-tdm-controller-component";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";

ServerEntityPrefabs.types.set(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new GameSpawnzonesComponent())
    entity.addComponent(new ServerTDMControllerComponent())
    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
})