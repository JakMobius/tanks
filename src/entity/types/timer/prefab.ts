import PrefabComponent from "src/entity/components/prefab-id-component";
import TimerComponent from "./timer-component";
import { transmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import Entity from "src/utils/ecs/entity";
import { EntityPrefab } from "src/entity/entity-prefabs";
import TimerTransmitter from "./server-side/timer-transmitter";

const Prefab = new EntityPrefab({
    id: "TIMER",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new TimerComponent())
        entity.addComponent(transmitterComponentFor(TimerTransmitter))
    }
})

export default Prefab;