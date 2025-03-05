import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerDMControllerComponent, {
    ServerDMControllerConfig
} from "src/entity/types/controller-dm/server-side/server-dm-controller-component";
import Entity from "src/utils/ecs/entity";

ServerEntityPrefabs.types.set(EntityType.DM_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.DM_GAME_MODE_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new ServerDMControllerComponent())
    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
})