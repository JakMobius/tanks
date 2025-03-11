import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import Entity from "src/utils/ecs/entity";
import WeaponSingleBarreled from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";
import BasePrefab from "./prefab"
import MortarBallPrefab from "../bullet-mortar-ball/server-prefab";
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
            .setShootRate(1)
            .setReloadTime(5)
            .setBulletPrefab(MortarBallPrefab)
            .setMuzzlePoint({x: 1.25, y: 0})
            .setFireSound(SoundType.SHOOT_MORTAR)
            .setInitialBulletVelocity(30)

        primaryWeaponEntity.getComponent(WeaponComponent)
            .setInfo({
                role: WeaponRole.primary,
                type: WeaponType.firearm,
                id: "mortar",
            })

        entity.appendChild(primaryWeaponEntity)

        ServerEntityPrefabs.armWithMiner(entity)
    }
})

export default ServerPrefab;