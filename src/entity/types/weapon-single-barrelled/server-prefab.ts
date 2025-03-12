import { EntityPrefab } from "src/entity/entity-prefabs"
import WeaponSingleBarrel from "src/entity/types/weapon-single-barrelled/weapon-single-barreled";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TimerTransmitter from "../timer/server-side/timer-transmitter";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)
        entity.addComponent(new WeaponSingleBarrel())
        entity.addComponent(createTransmitterComponentFor(TimerTransmitter))
    }
})

export default ServerPrefab;