import ServerPositionComponent from "./components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import Entity from "src/utils/ecs/entity";
import CollisionDisableComponent from "src/entity/components/collisions/collision-disable";
import CollisionDisableReceiver from "src/entity/components/collisions/collision-disable-receiver";
import HealthReceiver from "src/entity/components/health/health-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/collisions/collision-ignore-list-receiver";

export default class ClientEntityPrefabs {

    static types = new Map<number, (model: Entity) => void>()

    static configureClientEntity(entity: Entity) {
        entity.addComponent(new EntityStateReceiver())
    }

    static configureGameWorldEntity(entity: Entity) {
        this.configureClientEntity(entity)
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new CollisionDisableComponent())
        entity.addComponent(new CollisionDisableReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())
    }
}