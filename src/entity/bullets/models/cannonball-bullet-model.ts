import BulletModel from '../bullet-model';
import {BinarySerializer} from "../../../serialization/binary/serializable";
import PhysicsUtils from "../../../utils/physics-utils";
import {physicsFilters} from "../../../physics/categories";
import * as Box2D from 'src/library/box2d'
import PhysicalComponent from "../../entity-physics-component";

export default class BulletModelCannonball extends BulletModel {
    static typeName = 2

    initPhysics(world: Box2D.World) {
        const bodyFixtureDef = PhysicsUtils.squareFixture(0.375, 0.375, null, {
            density: 3,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.0,
            linearDamping: 0.3,
            bullet: true
        });

        body.CreateFixture(bodyFixtureDef)

        this.addComponent(new PhysicalComponent(body))
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