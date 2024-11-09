import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import FlameEffectComponent from "src/entity/types/effect-flame/flame-effect-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.EFFECT_FLAME, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.EFFECT_FLAME))
    entity.addComponent(new FlameEffectComponent())
})