
import BulletModel from '../bullet-model';
import {BinarySerializer} from "src/serialization/binary/serializable";
import * as Box2D from "src/library/box2d";
import PhysicsUtils from "src/utils/physicsutils";
import {physicsFilters} from "src/physics/categories";

export default class BulletModel16mm extends BulletModel {
    static typeName = 4

    initPhysics(world: Box2D.World) {

        let bodyFixture = PhysicsUtils.squareFixture(0.33, 1, null, {
            density: 3,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.0,
            linearDamping: 0.2,
            bullet: true
        })

        body.CreateFixture(bodyFixture)

        this.setBody(body)
    }
}

BinarySerializer.register(BulletModel16mm)