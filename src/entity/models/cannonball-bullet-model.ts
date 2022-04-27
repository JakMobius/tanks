import PhysicsUtils from "../../utils/physics-utils";
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";

EntityModel.Types.set(EntityType.BULLET_CANNONBALL, (entity) => {
    EntityModel.initializeEntity(entity)
    entity.addComponent(new PhysicalComponent((host) => {
        const bodyFixtureDef = PhysicsUtils.squareFixture(0.375, 0.375, null, {
            density: 3,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            angularDamping: 0.0,
            linearDamping: 0.3,
            bullet: true
        });

        body.CreateFixture(bodyFixtureDef)

        return body;
    }))
})

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