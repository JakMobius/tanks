import ChildTickComponent from "src/entity/components/child-tick-component"
import PrefabComponent from "src/entity/components/prefab-id-component"
import TransformComponent from "src/entity/components/transform/transform-component"
import SpawnzoneComponent from "./checkpoint-component"
import { EntityPrefab } from "src/entity/entity-prefabs"

const Prefab = new EntityPrefab({
    id: "CHECKPOINT",
    metadata: {
        displayName: "Чекпоинт"
    },
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new TransformComponent())
        entity.addComponent(new ChildTickComponent())
        entity.addComponent(new SpawnzoneComponent())
    }
})

export default Prefab;