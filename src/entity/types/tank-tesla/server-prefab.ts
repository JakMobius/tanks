import EntityPrefabs from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import {EntityType} from "src/entity/entity-type";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import WeaponStungun from "src/entity/types/weapon-stungun/weapon-stungun";
import Entity from "src/utils/ecs/entity";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";

ServerEntityPrefabs.types.set(EntityType.TANK_TESLA, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TANK_TESLA)(entity)

    entity.addComponent(new ServerEntityPilotComponent())
    entity.addComponent(new ExplodeOnDeathComponent())

    let primaryWeaponEntity = new Entity()
    ServerEntityPrefabs.types.get(EntityType.WEAPON_STUNGUN)(primaryWeaponEntity)
    primaryWeaponEntity.getComponent(WeaponStungun)
        .setDamage(10)
        .setRadius(10)

    primaryWeaponEntity.getComponent(WeaponComponent)
        .setInfo({
            role: WeaponRole.primary,
            type: WeaponType.charge,
            id: "tesla-gun",
        })

    ServerEntityPrefabs.armWithMiner(entity)
})