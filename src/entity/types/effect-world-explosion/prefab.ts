import { EntityPrefab } from "src/entity/entity-prefabs";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";
import PrefabComponent from "src/entity/components/prefab-id-component";

const Prefab = new EntityPrefab({
    id: "EFFECT_WORLD_EXPLOSION",
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new ExplodeComponent())
    }
})

export default Prefab;