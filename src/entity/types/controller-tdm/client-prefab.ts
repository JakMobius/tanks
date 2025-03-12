import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import { TDMGameStateHUD } from "src/client/ui/game-hud/tdm-game-hud/tdm-game-state-hud";
import { ClientGameControllerComponent } from "src/entity/components/game-mode/client-game-controller-component";
import GameModeEventReceiver from "src/entity/components/game-mode/game-mode-event-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";

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
        entity.addComponent(new ClientGameControllerComponent(TDMGameStateHUD))
    }
})

export default ClientPrefab;