import EntityPrefabs from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import {EntityType} from "src/entity/entity-type";
import PositionTransmitComponent from "src/server/entity/components/position-transmit-component";

ServerEntityPrefabs.types.set(EntityType.BULLET_42MM, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.BULLET_42MM)(entity)

    entity.addComponent(new BulletBehaviour({
        explodePower: 4,
        wallDamage: 500,
        entityDamage: 2
    }))

    entity.addComponent(new PositionTransmitComponent())
})