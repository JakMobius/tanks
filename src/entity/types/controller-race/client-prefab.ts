import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import GameModeEventReceiver from "src/entity/components/game-mode/game-mode-event-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import { RaceGameStateHUD } from "./client-side/race-game-state-hud";
import { ClientGameControllerComponent } from "src/entity/components/game-mode/client-game-controller-component";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Режимы"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new GameModeEventReceiver())
        entity.addComponent(new ClientGameControllerComponent(RaceGameStateHUD))
    }
})

export default ClientPrefab;