import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import TilemapHitEmitter from "src/entity/components/tilemap-hit-emitter";
import TransformComponent from "src/entity/components/transform-component";
import HealthComponent, {DamageModifiers, DamageTypes} from "src/entity/components/health-component";
import MortarBallHeightComponent from "src/entity/components/network/mortar-ball-height/mortar-ball-height-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.BULLET_MORTAR_BALL, (entity) => {
	entity.addComponent(new PrefabIdComponent(EntityType.BULLET_MORTAR_BALL))
	entity.addComponent(new TilemapHitEmitter())
	entity.addComponent(new TransformComponent())
	entity.addComponent(new HealthComponent())
	entity.addComponent(new SailingComponent(3))
	entity.addComponent(new MortarBallHeightComponent())
	entity.addComponent(new PhysicalComponent((host) => {
		const bodyFixtureDef = PhysicsUtils.squareFixture(0.5, 0.5, null, {
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

	entity.getComponent(HealthComponent)
		.setToMaxHealth(0.1)
		.addDamageModifier(DamageModifiers.resistance(0.2), DamageTypes.EXPLOSION)
})