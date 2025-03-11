import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import BasePrefab from "./prefab"
import ServerChatComponent from "./server-side/server-chat-component";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new ServerChatComponent())

        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        transmitComponent.visibleAnywhere = true
    }
})

export default ServerPrefab;