import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import TilemapHitEmitter from "src/entity/components/tilemap-hit-emitter";
import TransformComponent from "src/entity/components/transform/transform-component";
import HealthComponent from "src/entity/components/health/health-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import { DamageModifiers, DamageTypes } from "src/server/damage-reason/damage-reason";

EntityPrefabs.Types.set(EntityType.BULLET_MINE, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.BULLET_MINE))
    entity.addComponent(new TilemapHitEmitter())
    entity.addComponent(new TransformComponent())
    entity.addComponent(new HealthComponent())
    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(1.25, 1.25, null, {
            filter: physicsFilters.mine,
            isSensor: true
        })

        const body = host.world.CreateBody({
            // type: b2BodyType.b2_staticBody
        })

        body.CreateFixture(bodyFixture)

        return body;
    }))

    entity.getComponent(HealthComponent)
        .setToMaxHealth(0.1)
        .addDamageModifier(DamageModifiers.resistance(0.05), DamageTypes.EXPLOSION)
})
