import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import ChildTickComponent from "src/entity/components/child-tick-component";
import ClientPelletsEffectComponent from "src/entity/types/effect-pellets/client-side/client-pellets-effect-component";
import PelletsEffectReceiver from "src/entity/types/effect-pellets/client-side/pellets-effect-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ChildTickComponent())
        entity.addComponent(new PelletsEffectReceiver())
        entity.addComponent(new ClientPelletsEffectComponent())
    }
})

export default ClientPrefab;