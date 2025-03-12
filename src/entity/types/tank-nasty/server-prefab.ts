import WeaponFlamethrower from "src/entity/types/weapon-flamethrower/weapon-flamethrower";
import ExplodeOnDeathComponent from "src/entity/components/explode-on-death-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import Entity from "src/utils/ecs/entity";
import {WeaponComponent, WeaponRole, WeaponType} from "src/entity/components/weapon/weapon-component";
import BasePrefab from "./prefab"
import { EntityPrefab } from "src/entity/entity-prefabs";
import WeaponFlamethrowerPrefab from "src/entity/types/weapon-flamethrower/server-prefab";
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

        armWithMiner(entity)
    }
})

export default ServerPrefab;