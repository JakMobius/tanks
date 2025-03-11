import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import TimerReceiverComponent from "./client-side/timer-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)
        entity.addComponent(new TimerReceiverComponent())
    }
})

export default ClientPrefab;