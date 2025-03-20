import { EntityPrefab } from "src/entity/entity-prefabs";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import TransformTransmitter from "src/entity/components/transform/transform-transmitter";
import ServerCheckpointComponent from "./server-side/server-checkpoint-component";
import PhysicalComponent from "src/entity/components/physics-component";
import PhysicsUtils from "src/utils/physics-utils";
import { physicsFilters } from "src/physics/categories";
import * as Box2D from "@box2d/core"
import CheckpointTransmitter from "./server-side/checkpoint-transmitter";
import EntityHitEmitter from "src/entity/components/entity-hit-emitter";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(createTransmitterComponentFor(TransformTransmitter))
        entity.addComponent(createTransmitterComponentFor(CheckpointTransmitter))
        entity.addComponent(new ServerCheckpointComponent())
        entity.addComponent(new EntityHitEmitter())
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

export default ServerPrefab;