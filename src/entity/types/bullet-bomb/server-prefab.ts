import { EntityPrefab } from "src/entity/entity-prefabs";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import BasePrefab from "./prefab"
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
            explodePower: 5,
            diesOnWallHit: false,
            lifeTime: 3
        }))
    }
})

export default ServerPrefab;