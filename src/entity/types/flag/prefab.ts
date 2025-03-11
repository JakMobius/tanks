import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import SailingComponent from "src/entity/components/sailing-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import PrefabComponent from "src/entity/components/prefab-id-component";
import * as Box2D from "@box2d/core"
import Entity from "src/utils/ecs/entity";
import { EntityPrefab } from "src/entity/entity-prefabs";

const Prefab = new EntityPrefab({
    id: "FLAG",
    prefab: (entity: Entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        entity.addComponent(new TransformComponent())
        entity.addComponent(new SailingComponent(1))

        entity.addComponent(new PhysicalComponent((host) => {
            let bodyFixture = PhysicsUtils.squareFixture(2, 2, null, {
                density: 48,
                filter: physicsFilters.bullet,
            })

            const body = PhysicsUtils.dynamicBody(host.world, {
                linearDamping: 0.9,
                fixedRotation: true,
                type: Box2D.b2BodyType.b2_staticBody
            })

            body.CreateFixture(bodyFixture)

            return body
        }))
    }
})

export default Prefab;