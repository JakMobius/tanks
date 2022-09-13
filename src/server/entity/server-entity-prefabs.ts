import EntityStateTransmitComponent from "./components/entity-state-transmit-component";
import Entity from "src/utils/ecs/entity";
import EntityStateTransmitter from "../../entity/components/network/entity/entity-state-transmitter";
import EntityDataTransmitComponent from "../../entity/components/network/transmitting/entity-data-transmit-component";

export default class ServerEntityPrefabs {
    static types = new Map<number, (model: Entity) => void>()

    static setupEntity(model: Entity) {
        model.addComponent(new EntityDataTransmitComponent())
        model.addComponent(new EntityStateTransmitComponent())
    }
}