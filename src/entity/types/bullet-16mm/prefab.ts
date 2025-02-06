import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import TilemapHitEmitter from "src/entity/components/tilemap-hit-emitter";
import TransformComponent from "src/entity/components/transform-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import HealthComponent from "src/entity/components/health-component";
import { DamageModifiers, DamageTypes } from "src/server/damage-reason/damage-reason";

EntityPrefabs.Types.set(EntityType.BULLET_16MM, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.BULLET_16MM))
    entity.addComponent(new TilemapHitEmitter())
    entity.addComponent(new TransformComponent())
    entity.addComponent(new HealthComponent())
    entity.addComponent(new SailingComponent(1))
    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(0.0825, 0.25, null, {
            density: 48,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            angularDamping: 0.1,
            linearDamping: 0.2,
            bullet: true
        })

        body.CreateFixture(bodyFixture)

        return body
    }))

    entity.getComponent(HealthComponent)
        .setToMaxHealth(0.1)
        .addDamageModifier(DamageModifiers.resistance(0.2), DamageTypes.EXPLOSION)
})