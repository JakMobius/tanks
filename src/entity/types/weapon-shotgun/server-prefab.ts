import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import { EntityPrefab } from "src/entity/entity-prefabs"
import WeaponShotgun from "src/entity/types/weapon-shotgun/weapon-shotgun";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new WeaponShotgun())
    }
})

export default ServerPrefab;