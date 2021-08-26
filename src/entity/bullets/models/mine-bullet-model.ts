import BulletModel from '../bullet-model';
import {BinarySerializer} from "../../../serialization/binary/serializable";
import * as Box2D from "../../../library/box2d";
import PhysicsUtils from "../../../utils/physics-utils";
import {b2BodyType} from "../../../library/box2d/dynamics/b2_body";
import {physicsFilters} from "../../../physics/categories";

export default class BulletModelMine extends BulletModel {
    static typeName = 7

    initPhysics(world: Box2D.World) {
        let bodyFixture = PhysicsUtils.squareFixture(1.25, 1.25, null, {
            filter: physicsFilters.mine,
            isSensor: true
        })

        const body = world.CreateBody({
            type: b2BodyType.b2_staticBody
        })

        body.CreateFixture(bodyFixture)

        this.setBody(body)
    }
}

// module.exports = new MineType({
//     name: "mine",
//     explodePower: 15,
//     mass: 0.5,
//     velocity: 0,
//     explodes: true,
//     id: 7
// })

BinarySerializer.register(BulletModelMine)