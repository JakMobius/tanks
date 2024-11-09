import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import WeaponShotgun from "src/entity/types/weapon-shotgun/weapon-shotgun";

ServerEntityPrefabs.types.set(EntityType.WEAPON_SHOTGUN, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.WEAPON_SHOTGUN)(entity)

    entity.addComponent(new WeaponShotgun())
})
