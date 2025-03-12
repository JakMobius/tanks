import { EntityPrefab } from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerTDMController from "src/entity/types/controller-tdm/server-side/tdm-controller";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";
import BasePrefab from "./prefab"
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)
        entity.addComponent(new GameSpawnzonesComponent())
        entity.addComponent(new GameTimeComponent())
        entity.addComponent(new ServerTDMController())
        let transmitComponent = entity.getComponent(EntityDataTransmitComponent)
        transmitComponent.visibleAnywhere = true
    }
})

export default ServerPrefab;