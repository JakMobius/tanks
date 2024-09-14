import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.EFFECT_WORLD_EXPLOSION, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.EFFECT_WORLD_EXPLOSION))
    entity.addComponent(new ExplodeComponent())
})