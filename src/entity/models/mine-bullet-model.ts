import PhysicsUtils from "../../utils/physics-utils";
import {b2BodyType} from "../../library/box2d/dynamics/b2_body";
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";

EntityModel.Types.set(EntityType.BULLET_MINE, (entity) => {
    entity.on("attached-to-parent", (child, parent) => {
        if(child != entity) return

        let world = parent.getComponent(PhysicalHostComponent)

        let bodyFixture = PhysicsUtils.squareFixture(1.25, 1.25, null, {
            filter: physicsFilters.mine,
            isSensor: true
        })

        const body = world.world.CreateBody({
            type: b2BodyType.b2_staticBody
        })

        body.CreateFixture(bodyFixture)

        entity.addComponent(new PhysicalComponent(body, world))
    })
})

// module.exports = new MineType({
//     name: "mine",
//     explodePower: 15,
//     mass: 0.5,
//     velocity: 0,
//     explodes: true,
//     id: 7
// })