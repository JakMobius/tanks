
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerBullet from "../server-bullet";
import ServerEntity from "../server-entity";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import BulletBehaviour from "../bullet-behaviour";

ServerEntity.types.set(EntityType.BULLET_42MM, (entity: EntityModel) => {
    EntityModel.Types.get(EntityType.BULLET_42MM)(entity)
    ServerEntity.setupEntity(entity)

    entity.addComponent(new BulletBehaviour({
        initialVelocity: 112.5,
        explodePower: 5,
        wallDamage: 3000,
    }))

    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_42MM)
})