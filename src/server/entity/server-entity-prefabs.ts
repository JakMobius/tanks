import EntityStateTransmitComponent from "./components/entity-state-transmit-component";
import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import WeaponSingleBarreled from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import MinePrefab from "src/entity/types/bullet-mine/server-prefab";
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/server-prefab";

import serverPrefabs from 'src/entity/types/%/server-prefab.ts'
import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";

export default class ServerEntityPrefabs {
    static setupEntity(model: Entity) {
        model.addComponent(new EntityDataTransmitComponent())
        model.addComponent(new EntityStateTransmitComponent())
    }

    static armWithMiner(tank: Entity) {
        let minerWeaponEntity = new Entity()
        WeaponSingleBarrel.prefab(minerWeaponEntity)
        minerWeaponEntity.getComponent(WeaponSingleBarreled)
            .setMaxAmmo(1)
            .setBulletPrefab(MinePrefab)
            .setShootRate(0.1)

        minerWeaponEntity.getComponent(WeaponComponent)
            .setInfo({
                role: WeaponRole.miner,
                type: WeaponType.firearm,
                id: "miner",
            })

        tank.appendChild(minerWeaponEntity)
    }

    static getByType(type: EntityType) {
        let result = []
        for (let prefab of serverPrefabs) {
            if (prefab.metadata.type == type) {
                result.push(prefab)
            }
        }
        return result
    }

    static getById(id: string) {
        return this.prefabs.get(id)
    }
    
    static prefabs = new Map<string, EntityPrefab>(serverPrefabs.map(prefab => [prefab.id, prefab]))
    static tanks = this.getByType(EntityType.tank)
    static gameModes = this.getByType(EntityType.gameController)
}