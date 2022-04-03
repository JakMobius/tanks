
import BulletModel from '../bullet-model';
import * as Box2D from "../../../library/box2d";
import PhysicsUtils from "../../../utils/physics-utils";
import {physicsFilters} from "../../../physics/categories";
import {BinarySerializer} from "../../../serialization/binary/serializable";
import PhysicalComponent from "../../physics-component";
import PhysicalHostComponent from "../../../physics-world";

export default class BulletModelBomb extends BulletModel {
    static typeName = 5

    constructor() {
        super()
        this.diesAfterWallHit = false
    }

    initPhysics(world: PhysicalHostComponent) {

        const shape = new Box2D.CircleShape()
        shape.Set(new Box2D.Vec2(0, 0), 0.375)
        let bodyFixture = PhysicsUtils.createFixture(shape, {
            density: 3,
            filter: physicsFilters.bullet,
            friction: 0,
            restitution: 1
        })

        const body = PhysicsUtils.dynamicBody(world.world, {
            angularDamping: 0.0,
            linearDamping: 0.15,
            bullet: true
        });

        body.CreateFixture(bodyFixture)

        this.addComponent(new PhysicalComponent(body, world))
    }
}

BinarySerializer.register(BulletModelBomb)

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