import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import WeaponStungun from "src/entity/types/weapon-stungun/weapon-stungun";

ServerEntityPrefabs.types.set(EntityType.WEAPON_STUNGUN, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.WEAPON_STUNGUN)(entity)

    entity.addComponent(new WeaponStungun()
        .setChargeConsumption(0.4)
        .setRechargeSpeed(0.2))
})
