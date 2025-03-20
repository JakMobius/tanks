import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import SailingComponent from "src/entity/components/sailing-component";
import TilemapHitEmitter from "src/entity/components/tilemap-hit-emitter";
import TransformComponent from "src/entity/components/transform/transform-component";
import PrefabComponent from "src/entity/components/prefab-id-component";
import HealthComponent from "src/entity/components/health/health-component";
import { DamageModifiers, DamageTypes } from "src/server/damage-reason/damage-reason";
import Entity from "src/utils/ecs/entity";
import { EntityPrefab } from "src/entity/entity-prefabs";
import EntityHitEmitter from "src/entity/components/entity-hit-emitter";

const Prefab = new EntityPrefab({
    id: "BULLET_16MM",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new TilemapHitEmitter())
        entity.addComponent(new EntityHitEmitter())
        entity.addComponent(new TransformComponent())
        entity.addComponent(new HealthComponent())
        entity.addComponent(new SailingComponent(1))
        entity.addComponent(new PhysicalComponent((host) => {
            let bodyFixture = PhysicsUtils.squareFixture(0.25, 0.0825, null, {
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
    }
})

export default Prefab;