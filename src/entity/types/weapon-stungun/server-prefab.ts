import WeaponStungun from "src/entity/types/weapon-stungun/weapon-stungun";
import BasePrefab from "./prefab"
import { EntityPrefab } from "src/entity/entity-prefabs";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(new WeaponStungun()
            .setChargeConsumption(0.4)
            .setRechargeSpeed(0.2))
    }
})

export default ServerPrefab;