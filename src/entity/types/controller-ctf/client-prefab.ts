import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import { ClientGameControllerComponent } from "src/entity/components/game-mode/client-game-controller-component";
import { CTFGameStateHUD } from "src/client/ui/game-hud/ctf-game-hud/ctf-game-state-hud";
import GameModeEventReceiver from "src/entity/components/game-mode/game-mode-event-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Режимы"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)

        entity.addComponent(new GameModeEventReceiver())
        entity.addComponent(new ClientGameControllerComponent(CTFGameStateHUD))
    }
})

export default ClientPrefab;