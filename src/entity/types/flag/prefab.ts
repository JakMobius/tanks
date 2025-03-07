import PhysicsUtils from "src/utils/physics-utils";
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import TransformComponent from "src/entity/components/transform-component";
import FlagStateComponent from "src/entity/types/flag/flag-state-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.FLAG, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.FLAG))
    entity.addComponent(new TransformComponent())
    entity.addComponent(new SailingComponent(1))
    entity.addComponent(new FlagStateComponent())

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(2, 2, null, {
            density: 48,
            filter: physicsFilters.bullet
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            linearDamping: 0.9,
            fixedRotation: true
        })

        body.CreateFixture(bodyFixture)

        return body
    }))
})