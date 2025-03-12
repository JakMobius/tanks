import BulletBehaviour from "src/server/entity/bullet-behaviour";
import BasePrefab from "./prefab"
import { EntityPrefab } from "src/entity/entity-prefabs";
import Entity from "src/utils/ecs/entity";
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/server-prefab";
import WeaponSingleBarreled from "../weapon-single-barrelled/weapon-single-barreled";
import { WeaponComponent, WeaponRole, WeaponType } from "src/entity/components/weapon/weapon-component";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TransformTransmitter from "src/entity/components/transform/transform-transmitter";
import HealthTransmitter from "src/entity/components/health/health-transmitter";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(createTransmitterComponentFor(TransformTransmitter))
        entity.addComponent(createTransmitterComponentFor(HealthTransmitter))
        entity.addComponent(new BulletBehaviour({
            explodePower: 7,
            lifeTime: Infinity
        }))
    }
})

export default ServerPrefab;

export function armWithMiner(tank: Entity) {
    let minerWeaponEntity = new Entity()
    WeaponSingleBarrel.prefab(minerWeaponEntity)
    minerWeaponEntity.getComponent(WeaponSingleBarreled)
        .setMaxAmmo(1)
        .setBulletPrefab(ServerPrefab)
        .setShootRate(0.1)

    minerWeaponEntity.getComponent(WeaponComponent)
        .setInfo({
            role: WeaponRole.miner,
            type: WeaponType.firearm,
            id: "miner",
        })

    tank.appendChild(minerWeaponEntity)
}