import EntityStateTransmitComponent from "./components/entity-state-transmit-component";
import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import {EntityType} from "src/entity/entity-type";
import WeaponSingleBarreled from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

export default class ServerEntityPrefabs {
    static types = new Map<number, (model: Entity) => void>()

    static setupEntity(model: Entity) {
        model.addComponent(new EntityDataTransmitComponent())
        model.addComponent(new EntityStateTransmitComponent())
    }

    static armWithMiner(tank: Entity) {
        let minerWeaponEntity = new Entity()
        ServerEntityPrefabs.types.get(EntityType.WEAPON_SINGLE_BARRELLED)(minerWeaponEntity)
        minerWeaponEntity.getComponent(WeaponSingleBarreled)
            .setMaxAmmo(1)
            .setBulletType(EntityType.BULLET_MINE)
            .setShootRate(0.1)

        minerWeaponEntity.getComponent(WeaponComponent)
            .setInfo({
                role: WeaponRole.miner,
                type: WeaponType.firearm,
                id: "miner",
            })

        tank.appendChild(minerWeaponEntity)
    }
}