import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY))
})