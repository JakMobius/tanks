import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from '../../entity/entity-model';
import {Constructor} from "../../serialization/binary/serializable";
import HealthComponent from "../../entity/health-component";
import WriteBuffer from "../../serialization/binary/write-buffer";
import ReadBuffer from "../../serialization/binary/read-buffer";
import ServerPosition from "./server-position";

export default class ClientEntity extends AbstractEntity {

	static types = new Map<Constructor<EntityModel>, Constructor<ClientEntity>>()

    public hidden: boolean;

    constructor(model: EntityModel) {
        super(model);

        model.addComponent(new ServerPosition())
    }

    decodeDynamicData(decoder: ReadBuffer) {
        this.model.getComponent(ServerPosition).decodeMovement(decoder)
    }

    decodeInitialData(decoder: ReadBuffer) {
        this.model.getComponent(ServerPosition).decodePosition(decoder)

        const healthComponent = this.model.getComponent(HealthComponent)
        healthComponent.setHealth(decoder.readFloat32())
    }

    encodeInitialData(encoder: WriteBuffer) {
        throw new Error("Method not implemented")
    }

    encodeDynamicData(encoder: WriteBuffer): void {
        throw new Error("Method not implemented")
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

    damage(damage: number): void {
        // Client entity should not handle this
    }
}