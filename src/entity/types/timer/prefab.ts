import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.TIMER_ENTITY, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TIMER_ENTITY))
    entity.addComponent(new TimerComponent().withTransmitter())
})