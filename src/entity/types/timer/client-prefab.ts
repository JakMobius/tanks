import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import TimerReceiverComponent from "./client-side/timer-receiver";

ClientEntityPrefabs.types.set(EntityType.TIMER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.TIMER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new TimerReceiverComponent())
})