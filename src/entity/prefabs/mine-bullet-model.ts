import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityPrefabs from "../entity-prefabs";
import {EntityType} from "../entity-type";
import TilemapHitEmitter from "../components/tilemap-hit-emitter";
import TransformComponent from "../components/transform-component";
import HealthComponent from "../components/health-component";
import EffectHostComponent from "src/effects/effect-host-component";

EntityPrefabs.Types.set(EntityType.BULLET_MINE, (entity) => {
    entity.addComponent(new TilemapHitEmitter())
    entity.addComponent(new TransformComponent())
    entity.addComponent(new HealthComponent())
    entity.addComponent(new EffectHostComponent())
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
})

// module.exports = new MineType({
//     name: "mine",
//     explodePower: 15,
//     mass: 0.5,
//     velocity: 0,
//     explodes: true,
//     id: 7
// })