import { EntityPrefab } from "src/entity/entity-prefabs";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import WeaponStungun from "src/entity/types/weapon-stungun/weapon-stungun";
import Entity from "src/utils/ecs/entity";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import BasePrefab from "./prefab"
import WeaponStungunPrefab from "src/entity/types/weapon-stungun/server-prefab";
import { armWithMiner } from "../bullet-mine/server-prefab";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
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

        armWithMiner(entity)
    }
})

export default ServerPrefab;