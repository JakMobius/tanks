import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import GameModeEventReceiver from "src/entity/components/network/game-mode/game-mode-event-receiver";
import {
    ClientTDMControllerComponent
} from "src/entity/types/controller-tdm/client-side/client-tdm-controller-component";

ClientEntityPrefabs.associate(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new GameModeEventReceiver())
    entity.addComponent(new ClientTDMControllerComponent())
})