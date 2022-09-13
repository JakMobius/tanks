import ServerEntityPrefabs from "../server-entity-prefabs";
import EntityDataTransmitComponent
    from "../../../entity/components/network/transmitting/entity-data-transmit-component";
import BulletBehaviour from "../bullet-behaviour";
import HealthComponent, {DamageModifiers, DamageTypes} from "../../../entity/components/health-component";
import {EntityType} from "../../../entity/entity-type";
import EntityPrefabs from "../../../entity/entity-prefabs";

ServerEntityPrefabs.types.set(EntityType.BULLET_16MM, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.BULLET_16MM)(entity)

    entity.addComponent(new BulletBehaviour({
        initialVelocity: 150,
        explodePower: 0,
        wallDamage: 1000,
        entityDamage: 0.5
    }))

    entity.getComponent(HealthComponent)
        .setMaxHealth(0.1)
        .addDamageModifier(DamageModifiers.resistance(2), DamageTypes.EXPLOSION)
    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_16MM)
})