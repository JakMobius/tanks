
import PrefabComponent from "src/entity/components/prefab-id-component";
import { EntityPrefab } from "src/entity/entity-prefabs";
import Entity from "src/utils/ecs/entity";

const Prefab = new EntityPrefab({
    id: "CHAT",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))  
    }
})

export default Prefab;