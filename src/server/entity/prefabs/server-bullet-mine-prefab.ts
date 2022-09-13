import EntityPrefabs from "../../../entity/entity-prefabs";
import ServerEntityPrefabs from "../server-entity-prefabs";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import BulletBehaviour from "../bullet-behaviour";
import HealthComponent, {DamageModifiers, DamageTypes} from "../../../entity/components/health-component";
import {EntityType} from "../../../entity/entity-type";

ServerEntityPrefabs.types.set(EntityType.BULLET_MINE, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.BULLET_MINE)(entity)

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