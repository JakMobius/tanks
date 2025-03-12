import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import { ClientGameControllerComponent } from "src/entity/components/game-mode/client-game-controller-component";
import { CTFGameStateHUD } from "src/client/ui/game-hud/ctf-game-hud/ctf-game-state-hud";
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
        entity.addComponent(new ClientGameControllerComponent(CTFGameStateHUD))
    }
})

export default ClientPrefab;