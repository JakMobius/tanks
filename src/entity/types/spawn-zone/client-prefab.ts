
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import SpawnzoneDrawer from "./client-side/spawnzone-drawer";
import SpawnzoneReceiver from "./client-side/spawnzone-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Игровые элементы",
        displayName: "Зона спавна"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new SpawnzoneDrawer())
        entity.addComponent(new SpawnzoneReceiver())
    }
})

export default ClientPrefab;