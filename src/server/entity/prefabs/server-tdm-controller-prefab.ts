import ServerEntityPrefabs from "../server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerTDMControllerComponent from "src/server/room/game-modes/tdm/server-tdm-controller-component";

ServerEntityPrefabs.types.set(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new ServerTDMControllerComponent())
    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.setConfigScriptIndex(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)
    transmitComponent.visibleAnywhere = true
})