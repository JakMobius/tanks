import {EntityType} from "src/entity/entity-type";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";
import ServerSoundEffectComponent from "src/entity/types/effect-sound/server-side/server-sound-effect-component";

ServerEntityPrefabs.types.set(EntityType.EFFECT_SOUND_EFFECT, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.EFFECT_SOUND_EFFECT)(entity)

    entity.addComponent(new ServerSoundEffectComponent())
    entity.addComponent(new VisibilityInheritanceComponent())
})