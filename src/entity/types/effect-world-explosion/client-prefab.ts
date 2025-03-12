import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import ExplodeReceiver from "src/entity/types/effect-world-explosion/client-side/explode-receiver";
import ClientExplosionComponent from "src/entity/types/effect-world-explosion/client-side/client-explosion-component";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ExplodeReceiver())
        entity.addComponent(new ClientExplosionComponent())
    }
})

export default ClientPrefab;