import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";

ServerEntityPrefabs.types.set(EntityType.WEAPON_SINGLE_BARRELLED, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.WEAPON_SINGLE_BARRELLED)(entity)

    entity.addComponent(new WeaponSingleBarrel())
})
