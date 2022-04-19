import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from "../../entity/entity-model";
import ServerGameWorld from "../server-game-world";
import {Constructor} from "../../serialization/binary/serializable";
import PhysicalComponent from "../../entity/physics-component";
import HealthComponent from "../../entity/health-component";
import ReadBuffer from "../../serialization/binary/read-buffer";
import WriteBuffer from "../../serialization/binary/write-buffer";
import EntityDataEncoder from "./entity-data-encoder";

export default class ServerEntity extends AbstractEntity {
    static types = new Map<Constructor<EntityModel>, Constructor<ServerEntity>>()
    static globalId = 0

    constructor(model: EntityModel) {
        super(model);

        model.id = ServerEntity.globalId++
        model.addComponent(new EntityDataEncoder())
    }

    die() {
        this.model.dead = true
    }

    tick(dt: number) {
        this.model.tick(dt)
    }

    static fromModel(model: EntityModel): ServerEntity | null {
        let type = this.types.get(model.constructor as typeof EntityModel)

        if(type) {
            return new type({
                model: model
            })
        }
        return null
    }

    static associate(serverClass: Constructor<ServerEntity>, modelClass: Constructor<EntityModel>): void {
        this.types.set(modelClass, serverClass)
    }
}