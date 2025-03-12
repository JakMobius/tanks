import { EntityPrefab } from "src/entity/entity-prefabs"
import DoubleBarreledWeapon from "src/entity/types/weapon-double-barreled/double-barreled-weapon";
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
        entity.addComponent(createTransmitterComponentFor(TimerTransmitter))
        entity.addComponent(new DoubleBarreledWeapon()
            .setInitialBulletVelocity(150)
            .setBarrelOffset(0.2)
            .setBarrelLength(1.8))
    }
})

export default ServerPrefab;