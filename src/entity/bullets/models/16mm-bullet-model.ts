import BulletModel from '../bullet-model';
import {BinarySerializer} from "src/serialization/binary/serializable";
import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "../../physics-component";
import PhysicalHostComponent from "../../../physiсal-world-component";

export default class BulletModel16mm extends BulletModel {
    static typeName = 4

    initPhysics(world: PhysicalHostComponent) {

        let bodyFixture = PhysicsUtils.squareFixture(0.0825, 0.25, null, {
            density: 48,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(world.world, {
            angularDamping: 0.1,
            linearDamping: 0.2,
            bullet: true
        })

        body.CreateFixture(bodyFixture)

        this.addComponent(new PhysicalComponent(body, world))
    }
}

BinarySerializer.register(BulletModel16mm)