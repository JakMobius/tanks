import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";

ServerEntityPrefabs.types.set(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY)(entity)

    entity.addComponent(new GameSpawnzonesComponent())
    entity.addComponent(new ServerCTFControllerComponent())
    entity.getComponent(EntityDataTransmitComponent).visibleAnywhere = true
})