import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import { EntityPrefab } from "src/entity/entity-prefabs";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new BulletBehaviour({}))
    }
})

export default ServerPrefab;