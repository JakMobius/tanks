import PhysicsUtils from "src/utils/physics-utils";
import { physicsFilters } from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import SailingComponent from "src/entity/components/sailing-component";
import TilemapHitEmitter from "src/entity/components/tilemap-hit-emitter";
import TransformComponent from "src/entity/components/transform/transform-component";
import HealthComponent from "src/entity/components/health/health-component";
import PrefabComponent from "src/entity/components/prefab-id-component";
import { DamageModifiers, DamageTypes } from "src/server/damage-reason/damage-reason";
import Entity from "src/utils/ecs/entity";
import { EntityPrefab } from "src/entity/entity-prefabs";
import EntityHitEmitter from "src/entity/components/entity-hit-emitter";

const Prefab = new EntityPrefab({
    id: "BULLET_CANNONBALL",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new TilemapHitEmitter())
        entity.addComponent(new EntityHitEmitter())
        entity.addComponent(new TransformComponent())
        entity.addComponent(new HealthComponent())
        entity.addComponent(new SailingComponent(8000))
        entity.addComponent(new PhysicalComponent((host) => {
            const bodyFixtureDef = PhysicsUtils.squareFixture(0.375, 0.375, null, {
                density: 3,
                filter: physicsFilters.bullet
            })

            const body = PhysicsUtils.dynamicBody(host.world, {
                angularDamping: 0.0,
                linearDamping: 0.3,
                bullet: true
            });

            body.CreateFixture(bodyFixtureDef)

            return body;
        }))

        entity.getComponent(HealthComponent)
            .setToMaxHealth(0.1)
            .addDamageModifier(DamageModifiers.resistance(0.1), DamageTypes.EXPLOSION)
    }
})

export default Prefab;