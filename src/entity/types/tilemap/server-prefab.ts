import { EntityPrefab } from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import BasePrefab from "./prefab"
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TransformTransmitter from "src/entity/components/transform/transform-transmitter";
import MapTransmitter from "src/entity/components/map/map-transmitter";


const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(createTransmitterComponentFor(MapTransmitter))
        entity.addComponent(createTransmitterComponentFor(TransformTransmitter))
        entity.addComponent(new ExplodeEffectPool({
            damageBlocks: true
        }))
    
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        transmitComponent.visibleAnywhere = true
    }
})

export default ServerPrefab;