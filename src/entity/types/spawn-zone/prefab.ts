import ChildTickComponent from "src/entity/components/child-tick-component"
import PrefabIdComponent from "src/entity/components/prefab-id-component"
import TransformComponent from "src/entity/components/transform/transform-component"
import EntityPrefabs from "src/entity/entity-prefabs"
import { EntityType } from "src/entity/entity-type"
import SpawnzoneComponent from "./spawnzone-component"

EntityPrefabs.Types.set(EntityType.SPAWNZONE, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.SPAWNZONE))
    entity.addComponent(new TransformComponent())
    entity.addComponent(new ChildTickComponent())
    entity.addComponent(new SpawnzoneComponent())
})