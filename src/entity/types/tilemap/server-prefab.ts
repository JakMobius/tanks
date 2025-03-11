import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import BasePrefab from "./prefab"


const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new ExplodeEffectPool({
            damageBlocks: true
        }))
    
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        transmitComponent.visibleAnywhere = true
    }
})

export default ServerPrefab;