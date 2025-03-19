import Entity from "src/utils/ecs/entity"
import ClientEntityPrefabs from "../entity/client-entity-prefabs"
import { PrefabFilter } from "src/entity/components/inspector/entity-serializer"
import { EntityPrefab } from "src/entity/entity-prefabs"
import { EntityEditorTreeNodeComponent } from "../ui/scene-tree-view/components"

export const mapEditorEntityFactory = (id: string, entity: Entity) => {
    let prefab = ClientEntityPrefabs.getById(id)
    if(prefab) prefab.editorPrefab(entity)
    else console.error(`Failed to create entity with id ${id}`)
    return entity
}

export const mapEditorPrefabFilter: PrefabFilter = {
    root: (prefab: EntityPrefab) => {
        let entity = new Entity()
        entity.addComponent(new EntityEditorTreeNodeComponent())
        return entity
    },
    leaf: (prefab: EntityPrefab) => mapEditorPrefabFilter.root(prefab)
}