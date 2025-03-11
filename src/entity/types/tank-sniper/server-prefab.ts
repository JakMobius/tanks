import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import Entity from "src/utils/ecs/entity";
import WeaponSingleBarreled from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";
import BasePrefab from "./prefab"
import Bullet42mmPrefab from "../bullet-42mm/server-prefab";
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/server-prefab";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        displayName: "Снайпер",
        description: "Классический танк. Довольно быстрый и маневренный. " +
            "Взрыв от его снаряда может наносить урон по нескольким соперникам " +
            "одновременно, а длинное дуло обеспечивает высокую точность стрельбы."
    },
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)

        entity.addComponent(new ServerEntityPilotComponent())
        entity.addComponent(new ExplodeOnDeathComponent())

        let primaryWeaponEntity = new Entity()
        WeaponSingleBarrel.prefab(primaryWeaponEntity)
        primaryWeaponEntity.getComponent(WeaponSingleBarreled)
            .setMaxAmmo(5)
            .setShootRate(0.4)
            .setReloadTime(5)
            .setBulletPrefab(Bullet42mmPrefab)
            .setMuzzlePoint({x: 2.5, y: 0})
            .setFireSound(SoundType.SHOOT_SNIPER)
            .setInitialBulletVelocity(112.5)

        primaryWeaponEntity.getComponent(WeaponComponent)
            .setInfo({
                role: WeaponRole.primary,
                type: WeaponType.firearm,
                id: "rocket-launcher",
            })

        entity.appendChild(primaryWeaponEntity)

        ServerEntityPrefabs.armWithMiner(entity)
    }
})

export default ServerPrefab;