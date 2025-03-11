import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import * as Box2D from "@box2d/core";
import PhysicsChunk from "src/physics/physics-chunk";
import {Drawer} from "src/entity/types/flag/client-side/drawer";
import FlagStateReceiver from "./client-side/flag-state-receiver";
import BasePrefab from "./prefab"
import { EntityPrefab } from "src/entity/entity-prefabs";

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)
        entity.addComponent(new Drawer())

        entity.addComponent(new FlagStateReceiver())
        // Hack to prevent client-side collisions
        entity.on("should-collide", (body: Box2D.b2Body) => {
            return PhysicsChunk.getFromBody(body) !== null
        })
    }
})

export default ClientPrefab;