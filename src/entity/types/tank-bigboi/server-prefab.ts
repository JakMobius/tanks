import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import Entity from "src/utils/ecs/entity";
import WeaponSingleBarreled from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";
import BasePrefab from "./prefab"
import { EntityPrefab } from "src/entity/entity-prefabs";
import CannonballPrefab from "../bullet-cannonball/server-prefab";
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/server-prefab";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)

        entity.addComponent(new ServerEntityPilotComponent())
        entity.addComponent(new ExplodeOnDeathComponent())

        let primaryWeaponEntity = new Entity()
        WeaponSingleBarrel.prefab(primaryWeaponEntity)
        primaryWeaponEntity.getComponent(WeaponSingleBarreled)
            .setMaxAmmo(5)
            .setShootRate(2)
            .setReloadTime(7)
            .setBulletPrefab(CannonballPrefab)
            .setMuzzlePoint({x: 2.5, y: 0})
            .setFireSound(SoundType.SHOOT_BOMBER)
            .setInitialBulletVelocity(80)

        primaryWeaponEntity.getComponent(WeaponComponent)
            .setInfo({
                role: WeaponRole.primary,
                type: WeaponType.firearm,
                id: "cannon",
            })

        entity.appendChild(primaryWeaponEntity)

        ServerEntityPrefabs.armWithMiner(entity)
    }
})

export default ServerPrefab;