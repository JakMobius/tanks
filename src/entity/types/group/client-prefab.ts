
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Утилиты",
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
    }
})

export default ClientPrefab;