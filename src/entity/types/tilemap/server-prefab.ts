import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import SpawnzonesComponent from "src/map/spawnzones-component";

ServerEntityPrefabs.types.set(EntityType.TILEMAP, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TILEMAP)(entity)
    entity.addComponent(new SpawnzonesComponent())

    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
})