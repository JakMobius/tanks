import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import BulletBehaviour from "src/server/entity/bullet-behaviour";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import PositionTransmitComponent from "src/server/entity/components/position-transmit-component";
import MortarBallBulletBehaviour from "src/entity/types/bullet-mortar-ball/mortar-ball-bullet-behaviour";

ServerEntityPrefabs.types.set(EntityType.BULLET_MORTAR_BALL, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.BULLET_MORTAR_BALL)(entity)

    entity.addComponent(new BulletBehaviour({
        explodePower: 4,
        wallDamage: 500,
        entityDamage: 0.5
    }))

    entity.addComponent(new MortarBallBulletBehaviour())
    entity.addComponent(new PositionTransmitComponent())
})