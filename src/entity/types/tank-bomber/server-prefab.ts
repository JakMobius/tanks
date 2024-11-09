import EntityPrefabs from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import {EntityType} from "src/entity/entity-type";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import PositionTransmitComponent from "src/server/entity/components/position-transmit-component";
import Entity from "src/utils/ecs/entity";
import FirearmWeaponComponent from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";

ServerEntityPrefabs.types.set(EntityType.TANK_BOMBER, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TANK_BOMBER)(entity)

    entity.addComponent(new PositionTransmitComponent())
    entity.addComponent(new ServerEntityPilotComponent())
    entity.addComponent(new ExplodeOnDeathComponent())

    let primaryWeaponEntity = new Entity()
    ServerEntityPrefabs.types.get(EntityType.WEAPON_SINGLE_BARRELLED)(primaryWeaponEntity)
    primaryWeaponEntity.getComponent(FirearmWeaponComponent)
        .setMaxAmmo(5)
        .setShootRate(1)
        .setReloadTime(5)
        .setBulletType(EntityType.BULLET_BOMB)
        .setMuzzlePoint({x: 0, y: 2.5})
        .setFireSound(SoundType.SHOOT_BOMBER)
        .setInitialBulletVelocity(60)

    primaryWeaponEntity.getComponent(WeaponComponent)
        .setInfo({
            role: WeaponRole.primary,
            type: WeaponType.firearm,
            id: "bomber",
        })

    entity.appendChild(primaryWeaponEntity)

    ServerEntityPrefabs.armWithMiner(entity)
})