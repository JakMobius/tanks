
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import SpawnzoneDrawer from "./client-side/spawnzone-drawer";
import SpawnzoneReceiver from "./client-side/spawnzone-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import EditorEventReceiver from "src/client/map-editor/editor-event-receiver";
import EditorOutlineDrawerComponent from "src/client/map-editor/editor-outline-drawer-component";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Игровые элементы",
        displayName: "Зона спавна"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new SpawnzoneReceiver())
    },
    editorPrefab(entity) {
        ClientPrefab.prefab(entity)
        entity.addComponent(new EditorEventReceiver())
        entity.addComponent(new EditorOutlineDrawerComponent())
        entity.addComponent(new SpawnzoneDrawer())
    },
})

export default ClientPrefab;