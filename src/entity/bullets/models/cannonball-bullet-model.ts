import BulletModel from '../bullet-model';
import {BinarySerializer} from "../../../serialization/binary/serializable";
import PhysicsUtils from "../../../utils/physicsutils";
import {physicsFilters} from "../../../physics/categories";
import * as Box2D from 'src/library/box2d'

export default class BulletModelCannonball extends BulletModel {
    static typeName = 2

    initPhysics(world: Box2D.World) {
        const bodyFixtureDef = PhysicsUtils.squareFixture(1.5, 1.5, null, {
            density: 3,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.0,
            linearDamping: 0.3,
            bullet: true
        });

        body.CreateFixture(bodyFixtureDef)

        this.setBody(body)
    }
}

BinarySerializer.register(BulletModelCannonball)

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