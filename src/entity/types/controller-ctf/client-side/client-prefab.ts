import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import GameModeEventReceiver from "src/entity/components/network/game-mode/game-mode-event-receiver";
import {
    ClientCTFControllerComponent
} from "src/entity/types/controller-ctf/client-side/client-ctf-controller-component";

ClientEntityPrefabs.associate(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY, (entity) => {
    EntityPrefabs.Types.get(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new GameModeEventReceiver())
    entity.addComponent(new ClientCTFControllerComponent())
})