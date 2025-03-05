import DoubleBarreledWeapon from "src/entity/types/weapon-double-barreled/double-barreled-weapon";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import {EntityType} from "src/entity/entity-type";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import Entity from "src/utils/ecs/entity";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";

ServerEntityPrefabs.types.set(EntityType.TANK_TINY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TANK_TINY)(entity)

    entity.addComponent(new ServerEntityPilotComponent())
    entity.addComponent(new ExplodeOnDeathComponent())

    let primaryWeaponEntity = new Entity()
    ServerEntityPrefabs.types.get(EntityType.WEAPON_DOUBLE_BARELLED)(primaryWeaponEntity)
    primaryWeaponEntity.getComponent(DoubleBarreledWeapon)
        .setShootRate(0.2)
        .setMaxAmmo(20)
        .setReloadTime(7)
        .setBulletConfig({
            explodePower: 0,
            wallDamage: 300,
            entityDamage: 0.35
        })
        .setFireSound(SoundType.SHOOT_16MM)

    primaryWeaponEntity.getComponent(WeaponComponent)
        .setInfo({
            role: WeaponRole.primary,
            type: WeaponType.firearm,
            id: "machine-gun",
        })

    entity.appendChild(primaryWeaponEntity)

    ServerEntityPrefabs.armWithMiner(entity)
})