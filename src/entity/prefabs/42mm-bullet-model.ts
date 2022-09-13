import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityPrefabs from "../entity-prefabs";
import SailingComponent from "../components/sailing-component";
import {EntityType} from "../entity-type";
import TilemapHitEmitter from "../components/tilemap-hit-emitter";
import TransformComponent from "../components/transform-component";
import HealthComponent from "../components/health-component";
import EffectHostComponent from "src/effects/effect-host-component";

EntityPrefabs.Types.set(EntityType.BULLET_42MM, (entity) => {
	entity.addComponent(new TilemapHitEmitter())
	entity.addComponent(new TransformComponent())
	entity.addComponent(new HealthComponent())
	entity.addComponent(new EffectHostComponent())
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