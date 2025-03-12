import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import ClientChatComponent from "src/entity/types/chat/client-side/client-chat-component";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";


const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ClientChatComponent())
    }
})

export default ClientPrefab;