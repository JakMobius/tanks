import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import PelletsEffectComponent from "src/entity/types/effect-pellets/pellets-effect-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.EFFECT_SHOTGUN_PELLETS, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.EFFECT_SHOTGUN_PELLETS))
    entity.addComponent(new PelletsEffectComponent())
})