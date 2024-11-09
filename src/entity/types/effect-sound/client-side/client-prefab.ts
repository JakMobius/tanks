import {EntityType} from "src/entity/entity-type";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import SoundReceiver from "src/entity/types/effect-sound/client-side/sound-receiver";
import ClientSoundEffectComponent from "src/entity/types/effect-sound/client-side/client-sound-effect-component";

ClientEntityPrefabs.types.set(EntityType.EFFECT_SOUND_EFFECT, (entity) => {
    EntityPrefabs.Types.get(EntityType.EFFECT_SOUND_EFFECT)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)
    entity.addComponent(new SoundReceiver())
    entity.addComponent(new ClientSoundEffectComponent())
})