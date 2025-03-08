
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityType } from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import SpawnzoneDrawer from "./spawnzone-drawer";
import PositionReceiver from "src/entity/components/network/position/position-receiver";
import SpawnzoneReceiver from "./spawnzone-receiver";

ClientEntityPrefabs.associate(EntityType.SPAWNZONE, (entity) => {
    EntityPrefabs.Types.get(EntityType.SPAWNZONE)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)
    entity.addComponent(new ServerPositionComponent())
    entity.addComponent(new PositionReceiver())
    entity.addComponent(new SpawnzoneDrawer())
    entity.addComponent(new SpawnzoneReceiver())
})
