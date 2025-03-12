import { EntityPrefab } from "src/entity/entity-prefabs";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import TransformTransmitter from "src/entity/components/transform/transform-transmitter";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(createTransmitterComponentFor(TransformTransmitter))
    }
})

export default ServerPrefab;