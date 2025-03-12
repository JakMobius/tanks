import { EntityPrefab, EntityPrefabConfig } from "src/entity/entity-prefabs"
import Entity from "src/utils/ecs/entity"
import EditorOutlineDrawerComponent from "../map-editor/editor-outline-drawer-component"
import EditorEventReceiver from "../map-editor/editor-event-receiver"

export interface ClientEntityPrefabConfig extends EntityPrefabConfig {
    editorPrefab?: (entity: Entity) => void
}

function defaultEditorPrefab(prefab: EntityPrefabConfig) {
    return (entity: Entity) => {
        prefab.prefab(entity)
        entity.addComponent(new EditorOutlineDrawerComponent())
        entity.addComponent(new EditorEventReceiver())
    }
}

export default class ClientEntityPrefab extends EntityPrefab {
    editorPrefab: (entity: Entity) => void
    constructor(prefab: ClientEntityPrefabConfig) {
        super(prefab)
        this.editorPrefab = prefab.editorPrefab ?? defaultEditorPrefab(this)
    }
}