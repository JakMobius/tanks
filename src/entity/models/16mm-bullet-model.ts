import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";
import SailingComponent from "../components/sailing-component";

EntityModel.Types.set(EntityType.BULLET_16MM, (entity) => {
    EntityModel.initializeEntity(entity)
    entity.addComponent(new SailingComponent(10))
    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(0.0825, 0.25, null, {
            density: 48,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            angularDamping: 0.1,
            linearDamping: 0.2,
            bullet: true
        })

        body.CreateFixture(bodyFixture)

        return body
    }))
})