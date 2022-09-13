import EntityPrefabs from "src/entity/entity-prefabs";
import ServerEntityPrefabs from "../server-entity-prefabs";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import BulletBehaviour from "../bullet-behaviour";
import HealthComponent, {DamageModifiers, DamageTypes} from "src/entity/components/health-component";
import {EntityType} from "src/entity/entity-type";

ServerEntityPrefabs.types.set(EntityType.BULLET_CANNONBALL, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.BULLET_CANNONBALL)(entity)

    entity.addComponent(new BulletBehaviour({
        initialVelocity: 150,
        explodePower: 0,
        wallDamage: 7600
    }))

    entity.getComponent(HealthComponent)
        .setMaxHealth(0.1)
        .addDamageModifier(DamageModifiers.resistance(1), DamageTypes.EXPLOSION)
    entity.getComponent(EntityDataTransmitComponent).setConfigScriptIndex(EntityType.BULLET_CANNONBALL)
})