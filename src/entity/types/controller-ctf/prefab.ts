import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";
import PrefabComponent from "src/entity/components/prefab-id-component";
import Entity from "src/utils/ecs/entity";

const Prefab = new EntityPrefab({
    id: "CTF_CONTROLLER",
    metadata: {
        type: EntityType.gameController,
        shortName: "CTF",
        displayName: "Захват флага (CTF)",
    },
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
    }
})

export default Prefab;