import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import GameModeEventReceiver from "src/entity/components/game-mode/game-mode-event-receiver";

ClientEntityPrefabs.types.set(EntityType.DM_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.DM_GAME_MODE_CONTROLLER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)
    entity.addComponent(new GameModeEventReceiver())
})