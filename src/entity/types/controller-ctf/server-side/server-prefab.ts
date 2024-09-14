import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerCTFControllerComponent, {
    ServerCTFControllerConfig
} from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import Entity from "src/utils/ecs/entity";

export function serverCTFControllerPrefab(entity: Entity, config: ServerCTFControllerConfig) {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new ServerCTFControllerComponent(config))
    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
}