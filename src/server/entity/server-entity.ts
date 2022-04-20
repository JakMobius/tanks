import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from "../../entity/entity-model";
import {Constructor} from "../../serialization/binary/serializable";
import EntityDataEncoder from "./entity-data-encoder";
import EntityDataTransmitComponent, {TransmitContext} from "../../entity/components/network/entity-data-transmit-component";
import EffectTransmitterComponent from "../../entity/components/network/effect/effect-transmitter-component";
import PositionTransmitterComponent from "../../entity/components/network/position/position-transmitter-component";
import HealthTransmitterComponent from "../../entity/components/network/health/health-transmitter-component";

export default class ServerEntity extends AbstractEntity {
    static types = new Map<Constructor<EntityModel>, Constructor<ServerEntity>>()
    static globalId = 0

    constructor(model: EntityModel) {
        super(model);

        model.id = ServerEntity.globalId++
        model.addComponent(new EntityDataEncoder())
        model.addComponent(new EntityDataTransmitComponent(model.id))

        model.addComponent(new EffectTransmitterComponent())
        model.addComponent(new PositionTransmitterComponent())
        model.addComponent(new HealthTransmitterComponent())
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