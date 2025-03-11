import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import WeaponStungun from "src/entity/types/weapon-stungun/weapon-stungun";
import Entity from "src/utils/ecs/entity";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import BasePrefab from "./prefab"
import WeaponStungunPrefab from "src/entity/types/weapon-stungun/server-prefab";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)

        entity.addComponent(new ServerEntityPilotComponent())
        entity.addComponent(new ExplodeOnDeathComponent())

        let primaryWeaponEntity = new Entity()
        WeaponStungunPrefab.prefab(primaryWeaponEntity)
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
    }
})

export default ServerPrefab;