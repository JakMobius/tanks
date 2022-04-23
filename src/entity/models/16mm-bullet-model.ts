import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";

EntityModel.Types.set(EntityType.BULLET_16MM, (entity) => {
    entity.on("attached-to-parent", (child, parent) => {
        if(child != entity) return

        let world = parent.getComponent(PhysicalHostComponent)

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

        entity.addComponent(new PhysicalComponent(body, world))
    })
})