import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import GameModeEventReceiver from "src/entity/components/game-mode/game-mode-event-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Режимы"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)
        entity.addComponent(new GameModeEventReceiver())
    }
})

export default ClientPrefab;