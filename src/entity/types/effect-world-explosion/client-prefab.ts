import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ExplodeReceiver from "src/entity/types/effect-world-explosion/client-side/explode-receiver";
import ClientExplosionComponent from "src/entity/types/effect-world-explosion/client-side/client-explosion-component";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)
        entity.addComponent(new ExplodeReceiver())
        entity.addComponent(new ClientExplosionComponent())
    }
})

export default ClientPrefab;