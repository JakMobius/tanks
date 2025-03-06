import ChildTickComponent from "src/entity/components/child-tick-component"
import PrefabIdComponent from "src/entity/components/prefab-id-component"
import TransformComponent from "src/entity/components/transform-component"
import EntityPrefabs from "src/entity/entity-prefabs"
import { EntityType } from "src/entity/entity-type"

EntityPrefabs.Types.set(EntityType.GROUP, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.GROUP))
    entity.addComponent(new TransformComponent())
    entity.addComponent(new ChildTickComponent())
})