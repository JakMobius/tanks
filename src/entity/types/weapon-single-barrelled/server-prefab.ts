import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import { EntityPrefab } from "src/entity/entity-prefabs"
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new WeaponSingleBarrel())
    }
})

export default ServerPrefab;