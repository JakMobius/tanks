import ClientEntityPrefabs from "../client-entity-prefabs";
import EntityPrefabs from "../../../entity/entity-prefabs";
import {EntityType} from "../../../entity/entity-type";
import GameModeEventReceiver from "../../../entity/components/network/game-mode/game-mode-event-receiver";
import {ClientTDMControllerComponent} from "../components/game-modes/client-tdm-controller-component";

ClientEntityPrefabs.associate(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new GameModeEventReceiver())
    entity.addComponent(new ClientTDMControllerComponent())
})