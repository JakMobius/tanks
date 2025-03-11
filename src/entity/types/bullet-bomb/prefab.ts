import * as Box2D from "@box2d/core";
import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import TilemapHitEmitter from "src/entity/components/tilemap-hit-emitter";
import TransformComponent from "src/entity/components/transform/transform-component";
import HealthComponent from "src/entity/components/health/health-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import { DamageModifiers, DamageTypes } from "src/server/damage-reason/damage-reason";
import { b2ScaledCircleShape } from "src/physics/b2-scale-shape";

EntityPrefabs.Types.set(EntityType.BULLET_BOMB, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.BULLET_BOMB))
    entity.addComponent(new TilemapHitEmitter())
    entity.addComponent(new TransformComponent())
    entity.addComponent(new HealthComponent())
    entity.addComponent(new SailingComponent(1))
    entity.addComponent(new PhysicalComponent((host) => {
        const shape = new b2ScaledCircleShape()
        shape.Set(new Box2D.b2Vec2(0, 0), 0.375)

        let bodyFixture = PhysicsUtils.createFixture(shape, {
            density: 3,
            filter: physicsFilters.bullet,
            friction: 0,
            restitution: 1
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            angularDamping: 0.0,
            linearDamping: 0.15,
            bullet: true
        });

        body.CreateFixture(bodyFixture)

        return body;
    }))

    entity.getComponent(HealthComponent)
        .setToMaxHealth(0.1)
        .addDamageModifier(DamageModifiers.resistance(0.5), DamageTypes.EXPLOSION)
})
