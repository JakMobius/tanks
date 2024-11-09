import EntityPrefabs from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import {EntityType} from "src/entity/entity-type";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import PositionTransmitComponent from "src/server/entity/components/position-transmit-component";
import WeaponShotgun from "src/entity/types/weapon-shotgun/weapon-shotgun";
import Entity from "src/utils/ecs/entity";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";

ServerEntityPrefabs.types.set(EntityType.TANK_SHOTGUN, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TANK_SHOTGUN)(entity)

    entity.addComponent(new PositionTransmitComponent())
    entity.addComponent(new ServerEntityPilotComponent())
    entity.addComponent(new ExplodeOnDeathComponent())

    let primaryWeaponEntity = new Entity()
    ServerEntityPrefabs.types.get(EntityType.WEAPON_SHOTGUN)(primaryWeaponEntity)
    primaryWeaponEntity.getComponent(WeaponShotgun)
        .setDamage(6)
        .setRadius(15)
        .setShootRate(0.8)
        .setReloadTime(5)
        .setMaxAmmo(3)
        .setSpreadAngle(Math.PI / 4) // 45 deg
        .setWeaponAngle(-Math.PI / 2)
        .setFireSound(SoundType.SHOOT_SHOTGUN)

    primaryWeaponEntity.getComponent(WeaponComponent)
        .setInfo({
            role: WeaponRole.primary,
            type: WeaponType.firearm,
            id: "shotgun",
        })

    entity.appendChild(primaryWeaponEntity)

    ServerEntityPrefabs.armWithMiner(entity)
})