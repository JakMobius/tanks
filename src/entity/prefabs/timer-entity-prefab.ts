
import EntityPrefabs from "../entity-prefabs";
import {EntityType} from "../entity-type";
import TimerComponent from "../components/network/timer/timer-component";

EntityPrefabs.Types.set(EntityType.TIMER_ENTITY, (entity) => {
    entity.addComponent(new TimerComponent())
})