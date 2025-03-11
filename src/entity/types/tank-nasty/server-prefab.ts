import WeaponFlamethrower from "src/entity/types/weapon-flamethrower/weapon-flamethrower";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import Entity from "src/utils/ecs/entity";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import BasePrefab from "./prefab"
import { EntityPrefab } from "src/entity/entity-prefabs";
import WeaponFlamethrowerPrefab from "src/entity/types/weapon-flamethrower/server-prefab";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new ServerEntityPilotComponent())
        entity.addComponent(new ExplodeOnDeathComponent())

        let primaryWeaponEntity = new Entity()
        WeaponFlamethrowerPrefab.prefab(primaryWeaponEntity)

        primaryWeaponEntity.getComponent(WeaponComponent)
            .setInfo({
                role: WeaponRole.primary,
                type: WeaponType.charge,
                id: "flamethrower",
            })

        primaryWeaponEntity.getComponent(WeaponFlamethrower)
            .setDamage(3)
            .setRadius(25)
            .setAngle(Math.PI / 3)

        entity.appendChild(primaryWeaponEntity)

        ServerEntityPrefabs.armWithMiner(entity)
    }
})

export default ServerPrefab;