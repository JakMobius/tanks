
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import BasePrefab from "./prefab"
import CheckpointReceiver from "./client-side/checkpoint-receiver";
import CheckpointDrawer from "./client-side/checkpoint-drawer";

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Игровые элементы",
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new CheckpointDrawer())
        entity.addComponent(new CheckpointReceiver())
    }
})

export default ClientPrefab;