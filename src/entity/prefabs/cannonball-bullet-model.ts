import PhysicsUtils from "../../utils/physics-utils";
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityPrefabs from "../entity-prefabs";
import SailingComponent from "../components/sailing-component";
import {EntityType} from "../entity-type";
import TilemapHitEmitter from "../components/tilemap-hit-emitter";
import TransformComponent from "../components/transform-component";
import HealthComponent from "../components/health-component";
import EffectHostComponent from "../../effects/effect-host-component";

EntityPrefabs.Types.set(EntityType.BULLET_CANNONBALL, (entity) => {
    entity.addComponent(new TilemapHitEmitter())
    entity.addComponent(new TransformComponent())
    entity.addComponent(new HealthComponent())
    entity.addComponent(new EffectHostComponent())
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
})

// module.exports = new BulletType({
// 	name: "cannonball",
// 	explodePower: 2,
// 	mass: 30,
// 	wallDamage: 7600,
// 	playerDamage: 4,
// 	velocity: 600,
// 	explodes: false,
// 	id: 2
// })