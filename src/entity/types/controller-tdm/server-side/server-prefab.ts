import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerTDMControllerComponent, {
    ServerTDMControllerConfig
} from "src/entity/types/controller-tdm/server-side/server-tdm-controller-component";
import Entity from "src/utils/ecs/entity";

export function serverTDMControllerPrefab(entity: Entity, config: ServerTDMControllerConfig) {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new ServerTDMControllerComponent(config))
    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
}