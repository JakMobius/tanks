import PrefabComponent from "src/entity/components/prefab-id-component";
import TimerComponent from "./timer-component";
import Entity from "src/utils/ecs/entity";
import { EntityPrefab } from "src/entity/entity-prefabs";

const Prefab = new EntityPrefab({
    id: "TIMER",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new TimerComponent())
    }
})

export default Prefab;