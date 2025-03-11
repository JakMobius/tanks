import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import TimerComponent from "./timer-component";
import { transmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TimerTransmitter from "./server-prefab";

EntityPrefabs.Types.set(EntityType.TIMER_ENTITY, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TIMER_ENTITY))
    entity.addComponent(new TimerComponent())
    entity.addComponent(transmitterComponentFor(TimerTransmitter))
})