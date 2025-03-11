import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import CTFController from "src/entity/types/controller-ctf/server-side/ctf-controller";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)

        entity.addComponent(new GameSpawnzonesComponent())
        entity.addComponent(new GameTimeComponent())
        entity.addComponent(new CTFController())
        entity.getComponent(EntityDataTransmitComponent).visibleAnywhere = true
    }
})

export default ServerPrefab;