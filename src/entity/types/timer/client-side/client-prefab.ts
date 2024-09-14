import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import TimerReceiverComponent from "src/entity/components/network/timer/timer-receiver";

ClientEntityPrefabs.associate(EntityType.TIMER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.TIMER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new TimerReceiverComponent())
})