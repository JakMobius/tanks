import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";
import PrefabComponent from "src/entity/components/prefab-id-component";
import Entity from "src/utils/ecs/entity";

const Prefab = new EntityPrefab({
    id: "DM_CONTROLLER",
    metadata: {
        type: EntityType.gameController,
        shortName: "DM",
        displayName: "Каждый сам за себя (DM)",
    },
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
    }
})

export default Prefab;