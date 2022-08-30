import PhysicsUtils from "../../utils/physics-utils";
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityModel from "../entity-model";
import SailingComponent from "../components/sailing-component";
import {EntityType} from "../entity-type";

EntityModel.Types.set(EntityType.BULLET_42MM, (entity) => {
	EntityModel.initializeEntity(entity)
	entity.addComponent(new SailingComponent(3))
	entity.addComponent(new PhysicalComponent((host) => {
		const bodyFixtureDef = PhysicsUtils.squareFixture(0.125, 0.5, null, {
			density: 3,
			filter: physicsFilters.bullet
		})

		const body = PhysicsUtils.dynamicBody(host.world, {
			angularDamping: 0.0,
			linearDamping: 0.2,
			bullet: true
		});

		body.CreateFixture(bodyFixtureDef)

		return body
	}))
})