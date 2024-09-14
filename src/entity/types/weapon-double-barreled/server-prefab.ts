import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs"
import {EntityType} from "src/entity/entity-type"
import EntityPrefabs from "src/entity/entity-prefabs"
import DoubleBarreledWeapon from "src/entity/types/weapon-double-barreled/double-barreled-weapon";

ServerEntityPrefabs.types.set(EntityType.WEAPON_DOUBLE_BARELLED, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.WEAPON_DOUBLE_BARELLED)(entity)

    entity.addComponent(new DoubleBarreledWeapon()
        .setInitialBulletVelocity(150)
        .setBarrelOffset(0.2)
        .setBarrelLength(1.8))
})
