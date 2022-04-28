
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerEntity from "../server-entity";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import BulletBehaviour from "../bullet-behaviour";
import HealthComponent from "../../../entity/components/health-component";

ServerEntity.types.set(EntityType.BULLET_CANNONBALL, (entity: EntityModel) => {
    ServerEntity.setupEntity(entity)
    EntityModel.Types.get(EntityType.BULLET_CANNONBALL)(entity)

    entity.addComponent(new BulletBehaviour({
        initialVelocity: 150,
        explodePower: 0,
        wallDamage: 7600
    }))

    entity.getComponent(HealthComponent).setMaxHealth(0.01)
    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_CANNONBALL)
})