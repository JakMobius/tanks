import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from '../../entity/entity-model';
import {Constructor} from "../../serialization/binary/serializable";
import ServerPosition from "./server-position";
import EntityDataDecoder from "./entity-data-decoder";
import EntityDataReceiveComponent from "../../entity/components/network/entity-data-receive-component";
import EffectReceiverComponent from "../../entity/components/network/effect/effect-receiver-component";
import PositionReceiverComponent from "../../entity/components/network/position/position-receiver-component";
import HealthReceiverComponent from "../../entity/components/network/health/health-receiver-component";

export default class ClientEntity extends AbstractEntity {

	static types = new Map<Constructor<EntityModel>, Constructor<ClientEntity>>()

    public hidden: boolean;

    constructor(model: EntityModel) {
        super(model);

        model.addComponent(new ServerPosition())
        model.addComponent(new EntityDataDecoder())
        model.addComponent(new EntityDataReceiveComponent(this.model.id))

        model.addComponent(new EffectReceiverComponent())
        model.addComponent(new PositionReceiverComponent())
        model.addComponent(new HealthReceiverComponent())

        model.getComponent(EntityDataReceiveComponent).commandHandlers.set(193, (buffer) => {
            console.log(this.constructor.name + " received string from server: " + buffer.readString());
        })
    }

    /**
     * Associates client wrapper class with the bullet model
     * @param clientClass Client class to associate with bullet model
     * @param modelClass Bullet model
     */

    static associate(clientClass: Constructor<ClientEntity>, modelClass: Constructor<EntityModel>) {
        this.types.set(modelClass, clientClass)
    }

    static fromModel(model: EntityModel) {
        let type = this.types.get(model.constructor as typeof EntityModel)

        if(type) {
            return new type({
                model: model
            })
        }
        return null
    }
}