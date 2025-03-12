import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import * as Box2D from "@box2d/core";
import PhysicsChunk from "src/physics/physics-chunk";
import {Drawer} from "src/entity/types/flag/client-side/drawer";
import FlagStateReceiver from "./client-side/flag-state-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import HealthReceiver from "src/entity/components/health/health-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/collisions/collision-ignore-list-receiver";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())
        entity.addComponent(new Drawer())

        entity.addComponent(new FlagStateReceiver())
        // Hack to prevent client-side collisions
        entity.on("should-collide", (body: Box2D.b2Body) => {
            return PhysicsChunk.getFromBody(body) !== null
        })
    }
})

export default ClientPrefab;