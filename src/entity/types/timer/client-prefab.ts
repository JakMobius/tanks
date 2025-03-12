import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import TimerReceiverComponent from "./client-side/timer-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new TimerReceiverComponent())
    }
})

export default ClientPrefab;