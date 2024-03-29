import ServerPositionComponent from "./components/server-position-component";
import EffectReceiver from "src/entity/components/network/effect/effect-receiver";
import PositionReceiver from "src/entity/components/network/position/position-receiver";
import HealthReceiver from "src/entity/components/network/health/health-receiver";
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import Entity from "src/utils/ecs/entity";
import CollisionIgnoreListReceiver from "src/entity/components/network/collisions/collision-ignore-list-receiver";

export default class ClientEntityPrefabs {

	static types = new Map<number, (model: Entity) => void>()

    static configureClientEntity(entity: Entity) {
        entity.addComponent(new EntityStateReceiver())
    }

    static configureGameWorldEntity(entity: Entity) {
        this.configureClientEntity(entity)
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new EffectReceiver())
        entity.addComponent(new PositionReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())
    }

    static associate(type: number, configureFunction: (model: Entity) => void) {
        this.types.set(type, configureFunction)
    }
}