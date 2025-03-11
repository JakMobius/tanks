import { EntityPrefab } from "src/entity/entity-prefabs";
import SoundEffectComponent from "src/entity/types/effect-sound/sound-effect-component";
import PrefabComponent from "src/entity/components/prefab-id-component";

const Prefab = new EntityPrefab({
    id: "EFFECT_SOUND_EFFECT",
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new SoundEffectComponent())
    }
})

export default Prefab;