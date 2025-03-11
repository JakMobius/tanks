import { EntityPrefab } from "src/entity/entity-prefabs";
import PelletsEffectComponent from "src/entity/types/effect-pellets/pellets-effect-component";
import PrefabComponent from "src/entity/components/prefab-id-component";
import Entity from "src/utils/ecs/entity";

const Prefab = new EntityPrefab({
    id: "EFFECT_SHOTGUN_PELLETS",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new PelletsEffectComponent())
    }
})

export default Prefab;