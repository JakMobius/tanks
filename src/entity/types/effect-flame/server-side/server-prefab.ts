import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerFlameEffectComponent from "src/entity/types/effect-flame/server-side/server-flame-effect-component";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";

ServerEntityPrefabs.types.set(EntityType.EFFECT_FLAME, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.EFFECT_FLAME)(entity)

    entity.addComponent(new ServerFlameEffectComponent())
    entity.addComponent(new VisibilityInheritanceComponent())
})