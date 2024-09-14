import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import SoundEffectComponent from "src/entity/types/effect-sound/sound-effect-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.EFFECT_SOUND_EFFECT, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.EFFECT_SOUND_EFFECT))
    entity.addComponent(new SoundEffectComponent())
})