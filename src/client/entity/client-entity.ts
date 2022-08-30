
import EntityModel from '../../entity/entity-model';
import ServerPositionComponent from "./components/server-position-component";
import EffectReceiver from "../../entity/components/network/effect/effect-receiver";
import PositionReceiver from "../../entity/components/network/position/position-receiver";
import HealthReceiver from "../../entity/components/network/health/health-receiver";
import EntityStateReceiver from "../../entity/components/network/entity/entity-state-receiver";
import Entity from "../../utils/ecs/entity";
import CollisionIgnoreListReceiver from "../../entity/components/network/collisions/collision-ignore-list-receiver";

export default class ClientEntity {

	static types = new Map<number, (model: EntityModel) => void>()

    static configureEntity(model: Entity) {
        model.addComponent(new ServerPositionComponent())
        model.addComponent(new EntityStateReceiver())
        model.addComponent(new EffectReceiver())
        model.addComponent(new PositionReceiver())
        model.addComponent(new HealthReceiver())
        model.addComponent(new CollisionIgnoreListReceiver())
    }

    static associate(type: number, configureFunction: (model: EntityModel) => void) {
        this.types.set(type, configureFunction)
    }
}