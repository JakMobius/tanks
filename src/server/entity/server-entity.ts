import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from "../../entity/entity-model";
import EntityDataEncoder from "./entity-data-encoder";
import EntityDataTransmitComponent from "../../entity/components/network/transmitting/entity-data-transmit-component";

export default class ServerEntity extends AbstractEntity {
    static types = new Map<number, (model: EntityModel) => void>()

    static setupEntity(model: EntityModel) {
        model.addComponent(new EntityDataEncoder())
        model.addComponent(new EntityDataTransmitComponent())
    }
}