import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from '../../entity/entity-model';
import {Constructor} from "../../serialization/binary/serializable";
import HealthComponent from "../../entity/health-component";
import WriteBuffer from "../../serialization/binary/write-buffer";
import ReadBuffer from "../../serialization/binary/read-buffer";
import ServerPosition from "./server-position";
import EntityDataDecoder from "./entity-data-decoder";

export default class ClientEntity extends AbstractEntity {

	static types = new Map<Constructor<EntityModel>, Constructor<ClientEntity>>()

    public hidden: boolean;

    constructor(model: EntityModel) {
        super(model);

        model.addComponent(new ServerPosition())
        model.addComponent(new EntityDataDecoder())
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