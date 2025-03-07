import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";

ServerEntityPrefabs.types.set(EntityType.BULLET_16MM, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.BULLET_16MM)(entity)

    entity.addComponent(new BulletBehaviour({}))
})