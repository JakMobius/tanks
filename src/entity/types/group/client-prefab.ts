
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityType } from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import PositionReceiver from "src/entity/components/network/position/position-receiver";

ClientEntityPrefabs.associate(EntityType.GROUP, (entity) => {
    EntityPrefabs.Types.get(EntityType.GROUP)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)
    entity.addComponent(new ServerPositionComponent())
    entity.addComponent(new PositionReceiver())
})
