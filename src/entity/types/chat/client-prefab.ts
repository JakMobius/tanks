import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientChatComponent from "src/entity/types/chat/client-side/client-chat-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";

ClientEntityPrefabs.types.set(EntityType.CHAT_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.CHAT_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new ClientChatComponent())
})