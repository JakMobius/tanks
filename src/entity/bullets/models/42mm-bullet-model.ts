import BulletModel from '../bullet-model';
import {BinarySerializer} from "../../../serialization/binary/serializable";
import * as Box2D from 'src/library/box2d'
import PhysicsUtils from "../../../utils/physics-utils";
import {physicsFilters} from "../../../physics/categories";
import PhysicalComponent from "../../physics-component";
import PhysicalHostComponent from "../../../physics-world";

export default class BulletModel42mm extends BulletModel {
	static typeName = 0

	initPhysics(world: PhysicalHostComponent) {
		const bodyFixtureDef = PhysicsUtils.squareFixture(0.125, 0.5, null, {
			density: 3,
			filter: physicsFilters.bullet
		})

		const body = PhysicsUtils.dynamicBody(world.world, {
			angularDamping: 0.0,
			linearDamping: 0.2,
			bullet: true
		});

		body.CreateFixture(bodyFixtureDef)

		this.addComponent(new PhysicalComponent(body, world))
	}
}

BinarySerializer.register(BulletModel42mm)