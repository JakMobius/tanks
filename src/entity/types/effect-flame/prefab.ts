import { EntityPrefab } from "src/entity/entity-prefabs";
import FlameEffectComponent from "src/entity/types/effect-flame/flame-effect-component";
import PrefabComponent from "src/entity/components/prefab-id-component";
import Entity from "src/utils/ecs/entity";

const Prefab = new EntityPrefab({
    id: "EFFECT_FLAME",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new FlameEffectComponent())
    }
})

export default Prefab;