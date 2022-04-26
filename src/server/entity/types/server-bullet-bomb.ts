
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerBullet from "../server-bullet";
import ServerEntity from "../server-entity";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import BulletBehaviour from "../bullet-behaviour";

ServerEntity.types.set(EntityType.BULLET_BOMB, (entity: EntityModel) => {
    EntityModel.Types.get(EntityType.BULLET_BOMB)(entity)
    ServerEntity.setupEntity(entity)

    entity.addComponent(new BulletBehaviour({
        initialVelocity: 50,
        explodePower: 5,
        diesOnWallHit: false,
        lifeTime: 7
    }))

    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_BOMB)
})