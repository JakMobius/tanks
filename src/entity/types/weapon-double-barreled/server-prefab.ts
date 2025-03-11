import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import { EntityPrefab } from "src/entity/entity-prefabs"
import DoubleBarreledWeapon from "src/entity/types/weapon-double-barreled/double-barreled-weapon";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new DoubleBarreledWeapon()
            .setInitialBulletVelocity(150)
            .setBarrelOffset(0.2)
            .setBarrelLength(1.8))
    }
})

export default ServerPrefab;