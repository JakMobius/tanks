
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import BasePrefab from "./prefab"
import CheckpointReceiver from "./client-side/checkpoint-receiver";
import CheckpointDrawer from "./client-side/checkpoint-drawer";
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import ClientCheckpointComponent from "./client-side/client-checkpoint-component";
import PhysicalComponent from "src/entity/components/physics-component";
import PhysicsUtils from "src/utils/physics-utils";
import { physicsFilters } from "src/physics/categories";
import * as Box2D from "@box2d/core"

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        editorPath: "Игровые элементы",
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new ClientCheckpointComponent())
        entity.addComponent(new CheckpointDrawer())
        entity.addComponent(new CheckpointReceiver())
        entity.addComponent(new PhysicalComponent((host) => {
            let bodyFixture = PhysicsUtils.squareFixture(1, 1, null, {
                filter: physicsFilters.checkpoint,
                isSensor: true
            })

            const body = host.world.CreateBody({
                type: Box2D.b2BodyType.b2_staticBody
            })

            body.CreateFixture(bodyFixture)

            return body;
        }))
    }
})

export default ClientPrefab;