import { EntityPrefab } from "src/entity/entity-prefabs";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import BasePrefab from "./prefab"
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)

        entity.addComponent(new BulletBehaviour({
            explodePower: 5,
            diesOnWallHit: false,
            lifeTime: 3
        }))
    }
})

export default ServerPrefab;