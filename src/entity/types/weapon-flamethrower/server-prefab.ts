import { EntityPrefab } from "src/entity/entity-prefabs"
import WeaponFlamethrower from "src/entity/types/weapon-flamethrower/weapon-flamethrower";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)
        entity.addComponent(new WeaponFlamethrower()
            .setChargeConsumption(0.3)
            .setRechargeSpeed(0.2))
    }
})

export default ServerPrefab;