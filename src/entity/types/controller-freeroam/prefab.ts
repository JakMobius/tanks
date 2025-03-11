import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.FREEROAM_CONTROLLER_ENTITY, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.FREEROAM_CONTROLLER_ENTITY))
})