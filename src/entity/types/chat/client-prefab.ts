import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientChatComponent from "src/entity/types/chat/client-side/client-chat-component";
import { EntityPrefab } from "src/entity/entity-prefabs";
import BasePrefab from "./prefab"


const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)

        entity.addComponent(new ClientChatComponent())
    }
})

export default ClientPrefab;