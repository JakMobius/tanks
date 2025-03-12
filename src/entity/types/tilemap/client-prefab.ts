import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import MapDrawerComponent from "./client-side/map-drawer-component";
import MapReceiver from "src/entity/components/map/map-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import { EditorOutlineBoundsComponent } from "src/client/map-editor/editor-outline-bounds-component";
import TilemapComponent from "src/map/tilemap-component";
import EditorEventReceiver from "src/client/map-editor/editor-event-receiver";
import EditorOutlineDrawerComponent from "src/client/map-editor/editor-outline-drawer-component";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Игровые элементы",
        displayName: "Карта"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        
        entity.addComponent(new MapDrawerComponent())
        entity.addComponent(new MapReceiver())
    },
    editorPrefab: (entity) => {
        ClientPrefab.prefab(entity)
        entity.addComponent(new EditorEventReceiver())
        entity.addComponent(new EditorOutlineDrawerComponent())

        const update = () => {
            let map = entity.getComponent(TilemapComponent)
            entity.getComponent(EditorOutlineBoundsComponent).setBox(0, 0, map.width, map.height)
        }

        entity.addComponent(new EditorOutlineBoundsComponent())
        update()
        entity.on("update", update)
    }
})

export default ClientPrefab;