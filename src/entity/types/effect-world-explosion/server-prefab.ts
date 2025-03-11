import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ServerExplosionComponent from "src/entity/types/effect-world-explosion/server-side/server-explosion-component";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new ServerExplosionComponent())
        entity.addComponent(new VisibilityInheritanceComponent())
    }
})

export default ServerPrefab;