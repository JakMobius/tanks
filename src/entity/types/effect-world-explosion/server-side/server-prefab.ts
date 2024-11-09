import {EntityType} from "src/entity/entity-type";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerExplosionComponent from "src/entity/types/effect-world-explosion/server-side/server-explosion-component";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";

ServerEntityPrefabs.types.set(EntityType.EFFECT_WORLD_EXPLOSION, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.EFFECT_WORLD_EXPLOSION)(entity)

    entity.addComponent(new ServerExplosionComponent())
    entity.addComponent(new VisibilityInheritanceComponent())
})