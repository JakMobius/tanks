import BulletModel from '../bullet-model';
import {BinarySerializer} from "../../../serialization/binary/serializable";
import PhysicsUtils from "../../../utils/physics-utils";
import {b2BodyType} from "../../../library/box2d/dynamics/b2_body";
import {physicsFilters} from "../../../physics/categories";
import PhysicalComponent from "../../physics-component";
import PhysicalHostComponent from "../../../physiсal-world-component";

export default class BulletModelMine extends BulletModel {
    static typeName = 7

    initPhysics(world: PhysicalHostComponent) {
        let bodyFixture = PhysicsUtils.squareFixture(1.25, 1.25, null, {
            filter: physicsFilters.mine,
            isSensor: true
        })

        const body = world.world.CreateBody({
            type: b2BodyType.b2_staticBody
        })

        body.CreateFixture(bodyFixture)

        this.addComponent(new PhysicalComponent(body, world))
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