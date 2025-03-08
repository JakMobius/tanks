import { EntityType } from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";

ServerEntityPrefabs.types.set(EntityType.SPAWNZONE, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.SPAWNZONE)(entity)
})
