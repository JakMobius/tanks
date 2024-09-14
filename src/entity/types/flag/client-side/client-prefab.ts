import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import * as Box2D from "src/library/box2d";
import PhysicsChunk from "src/physics/physics-chunk";
import FlagStateReceiver from "src/entity/types/flag/client-side/flag-state-receiver";
import FlagStateComponent from "src/entity/types/flag/flag-state-component";
import {Drawer} from "src/entity/types/flag/client-side/drawer";

ClientEntityPrefabs.associate(EntityType.FLAG, (entity) => {
    EntityPrefabs.Types.get(EntityType.FLAG)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new Drawer())

    entity.addComponent(new FlagStateComponent())
    entity.addComponent(new FlagStateReceiver())
    // Hack to prevent client-side collisions
    entity.on("should-collide", (body: Box2D.Body) => {
        return PhysicsChunk.getFromBody(body) !== null
    })
})