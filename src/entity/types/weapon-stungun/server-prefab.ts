import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import WeaponStungun from "src/entity/types/weapon-stungun/weapon-stungun";
import BasePrefab from "./prefab"
import { EntityPrefab } from "src/entity/entity-prefabs";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)

        entity.addComponent(new WeaponStungun()
            .setChargeConsumption(0.4)
            .setRechargeSpeed(0.2))
    }
})

export default ServerPrefab;