
import EntityModel from "../../entity/entity-model";
import EntityDataTransmitComponent from "../../entity/components/network/transmitting/entity-data-transmit-component";
import ServerEntityDataTransmitComponent from "./server-entity-data-transmit-component";

export default class ServerEntity {
    static types = new Map<number, (model: EntityModel) => void>()

    static setupEntity(model: EntityModel) {
        model.addComponent(new ServerEntityDataTransmitComponent())
    }
}