import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";
import FreeroamController from "./server-side/freeroam-controller";


ServerEntityPrefabs.types.set(EntityType.FREEROAM_CONTROLLER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.FREEROAM_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new GameSpawnzonesComponent())
    entity.addComponent(new FreeroamController())
    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
})