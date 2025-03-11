import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import { TDMGameStateHUD } from "src/client/ui/game-hud/tdm-game-hud/tdm-game-state-hud";
import { ClientGameControllerComponent } from "src/entity/components/game-mode/client-game-controller-component";
import GameModeEventReceiver from "src/entity/components/game-mode/game-mode-event-receiver";

ClientEntityPrefabs.types.set(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new GameModeEventReceiver())
    entity.addComponent(new ClientGameControllerComponent(TDMGameStateHUD))
})