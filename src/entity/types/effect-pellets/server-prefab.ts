import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerPelletsEffectComponent from "src/entity/types/effect-pellets/server-side/server-pellets-effect-component";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)
        entity.addComponent(new ServerPelletsEffectComponent())
        entity.addComponent(new VisibilityInheritanceComponent())
    }
})

export default ServerPrefab;