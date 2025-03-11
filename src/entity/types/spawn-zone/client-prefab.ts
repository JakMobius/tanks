
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityType } from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import SpawnzoneDrawer from "./client-side/spawnzone-drawer";
import SpawnzoneReceiver from "./client-side/spawnzone-receiver";

ClientEntityPrefabs.types.set(EntityType.SPAWNZONE, (entity) => {
    EntityPrefabs.Types.get(EntityType.SPAWNZONE)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)
    entity.addComponent(new ServerPositionComponent())
    entity.addComponent(new TransformReceiver())
    entity.addComponent(new SpawnzoneDrawer())
    entity.addComponent(new SpawnzoneReceiver())
})
