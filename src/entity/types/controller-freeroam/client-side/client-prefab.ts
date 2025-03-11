import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import GameModeEventReceiver from "src/entity/components/network/game-mode/game-mode-event-receiver";

ClientEntityPrefabs.associate(EntityType.FREEROAM_CONTROLLER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.FREEROAM_CONTROLLER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)
    entity.addComponent(new GameModeEventReceiver())
})