import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import VisibilityInheritanceComponent from "src/entity/components/network/transmitting/visibility-inheritance-component";



ServerEntityPrefabs.types.set(EntityType.TILEMAP, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TILEMAP)(entity)
    entity.addComponent(new ExplodeEffectPool({
        damageBlocks: true
    }))

    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.visibleAnywhere = true
})