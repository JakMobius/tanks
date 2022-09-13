
import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "../../../entity/entity-prefabs";
import {EntityType} from "../../../entity/entity-type";
import TimerReceiverComponent from "../../../entity/components/network/timer/timer-receiver";

ClientEntityPrefabs.associate(EntityType.TIMER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.TIMER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new TimerReceiverComponent())
})