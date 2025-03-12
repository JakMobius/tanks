import { EntityPrefab } from "src/entity/entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import Entity from "src/utils/ecs/entity";
import WeaponSingleBarreled from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";
import BasePrefab from "./prefab"
import MortarBallPrefab from "../bullet-mortar-ball/server-prefab";
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/server-prefab";
import { armWithMiner } from "../bullet-mine/server-prefab";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TransformTransmitter from "src/entity/components/transform/transform-transmitter";
import HealthTransmitter from "src/entity/components/health/health-transmitter";
import EntityPilotTransmitter from "src/entity/components/entity-player-list/entity-pilot-transmitter";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(createTransmitterComponentFor(TransformTransmitter))
        entity.addComponent(createTransmitterComponentFor(HealthTransmitter))
        entity.addComponent(createTransmitterComponentFor(EntityPilotTransmitter))
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

        armWithMiner(entity)
    }
})

export default ServerPrefab;