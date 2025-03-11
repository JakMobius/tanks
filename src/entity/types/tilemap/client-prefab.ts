import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import MapDrawerComponent from "./client-side/map-drawer-component";
import MapReceiver from "src/entity/components/map/map-receiver";

ClientEntityPrefabs.types.set(EntityType.TILEMAP, (entity) => {
    EntityPrefabs.Types.get(EntityType.TILEMAP)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new MapDrawerComponent())
    entity.addComponent(new MapReceiver())
})