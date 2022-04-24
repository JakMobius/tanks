import * as Box2D from "../../library/box2d";
import PhysicsUtils from "../../utils/physics-utils";
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";


EntityModel.Types.set(EntityType.BULLET_BOMB, (entity) => {
    entity.addComponent(new PhysicalComponent((host) => {
        const shape = new Box2D.CircleShape()
        shape.Set(new Box2D.Vec2(0, 0), 0.375)
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
})

// module.exports = new BombType({
// 	name: "bomb",
// 	explodePower: 14,
// 	mass: 30,
// 	playerDamage: 0,
// 	velocity: 160,
// 	explodes: false,
// 	size: 2,
// 	lifetime: 3,
// 	grip: 20,
// 	id: 1


// })