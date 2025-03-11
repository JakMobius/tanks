import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import CTFController from "src/entity/types/controller-ctf/server-side/ctf-controller";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";

ServerEntityPrefabs.types.set(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new GameSpawnzonesComponent())
    entity.addComponent(new GameTimeComponent())
    entity.addComponent(new CTFController())
    entity.getComponent(EntityDataTransmitComponent).visibleAnywhere = true
})