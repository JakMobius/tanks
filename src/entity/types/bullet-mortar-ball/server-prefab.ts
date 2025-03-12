import BulletBehaviour from "src/server/entity/bullet-behaviour";
import { EntityPrefab } from "src/entity/entity-prefabs";
import MortarBallBulletBehaviour from "src/entity/types/bullet-mortar-ball/mortar-ball-bullet-behaviour";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TransformTransmitter from "src/entity/components/transform/transform-transmitter";
import HealthTransmitter from "src/entity/components/health/health-transmitter";
import MortarBallHeightTransmitter from "./mortar-ball-height-transmitter";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(createTransmitterComponentFor(TransformTransmitter))
        entity.addComponent(createTransmitterComponentFor(HealthTransmitter))
        entity.addComponent(createTransmitterComponentFor(MortarBallHeightTransmitter))
        entity.addComponent(new BulletBehaviour({
            explodePower: 4,
            wallDamage: 500,
            entityDamage: 0.5
        }))
    
        entity.addComponent(new MortarBallBulletBehaviour())
    }
})

export default ServerPrefab;