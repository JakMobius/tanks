
import {EntityType} from "../../../client/entity/client-entity";
import EntityModel from "../../../entity/entity-model";
import ServerEntity from "../server-entity";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import BulletBehaviour from "../bullet-behaviour";
import HealthComponent, {DamageModifiers, DamageTypes} from "../../../entity/components/health-component";

ServerEntity.types.set(EntityType.BULLET_MINE, (entity: EntityModel) => {
    ServerEntity.setupEntity(entity)
    EntityModel.Types.get(EntityType.BULLET_MINE)(entity)

    entity.addComponent(new BulletBehaviour({
        initialVelocity: 0,
        explodePower: 7,
        lifeTime: Infinity
    }))

    entity.getComponent(HealthComponent)
        .setMaxHealth(0.1)
        .addDamageModifier(DamageModifiers.resistance(0.5), DamageTypes.EXPLOSION)
    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_MINE)
})