import PhysicsUtils from "../../utils/physics-utils";
import {b2BodyType} from "../../library/box2d/dynamics/b2_body";
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";

EntityModel.Types.set(EntityType.BULLET_MINE, (entity) => {
    EntityModel.initializeEntity(entity)
    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(1.25, 1.25, null, {
            filter: physicsFilters.mine,
            isSensor: true
        })

        const body = host.world.CreateBody({
            // type: b2BodyType.b2_staticBody
        })

        body.CreateFixture(bodyFixture)

        return body;
    }))
})

// module.exports = new MineType({
//     name: "mine",
//     explodePower: 15,
//     mass: 0.5,
//     velocity: 0,
//     explodes: true,
//     id: 7
// })