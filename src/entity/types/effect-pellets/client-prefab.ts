import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ChildTickComponent from "src/entity/components/child-tick-component";
import ClientPelletsEffectComponent from "src/entity/types/effect-pellets/client-side/client-pellets-effect-component";
import PelletsEffectReceiver from "src/entity/types/effect-pellets/client-side/pellets-effect-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)

        entity.addComponent(new ChildTickComponent())
        entity.addComponent(new PelletsEffectReceiver())
        entity.addComponent(new ClientPelletsEffectComponent())
    }
})

export default ClientPrefab;