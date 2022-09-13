
import ServerEntityPrefabs from "../server-entity-prefabs";
import {EntityType} from "../../../entity/entity-type";
import EntityPrefabs from "../../../entity/entity-prefabs";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";

ServerEntityPrefabs.types.set(EntityType.TIMER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.TIMER_ENTITY)(entity)

    let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
    transmitComponent.setConfigScriptIndex(EntityType.TIMER_ENTITY)
    transmitComponent.visibleAnywhere = true
})