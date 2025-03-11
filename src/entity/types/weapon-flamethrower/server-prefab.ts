import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import { EntityPrefab } from "src/entity/entity-prefabs"
import WeaponFlamethrower from "src/entity/types/weapon-flamethrower/weapon-flamethrower";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new WeaponFlamethrower()
            .setChargeConsumption(0.3)
            .setRechargeSpeed(0.2))
    }
})

export default ServerPrefab;