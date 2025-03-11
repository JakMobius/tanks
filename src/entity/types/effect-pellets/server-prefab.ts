import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerPelletsEffectComponent from "src/entity/types/effect-pellets/server-side/server-pellets-effect-component";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";

ServerEntityPrefabs.types.set(EntityType.EFFECT_SHOTGUN_PELLETS, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.EFFECT_SHOTGUN_PELLETS)(entity)

    entity.addComponent(new ServerPelletsEffectComponent())
    entity.addComponent(new VisibilityInheritanceComponent())
})
