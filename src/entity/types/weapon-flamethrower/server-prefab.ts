import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import WeaponFlamethrower from "src/entity/types/weapon-flamethrower/weapon-flamethrower";

ServerEntityPrefabs.types.set(EntityType.WEAPON_FLAMETHROWER, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.WEAPON_FLAMETHROWER)(entity)

    entity.addComponent(new WeaponFlamethrower()
        .setChargeConsumption(0.3)
        .setRechargeSpeed(0.2))
})
