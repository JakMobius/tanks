import EntityStateTransmitComponent from "./components/entity-state-transmit-component";
import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";

export default class ServerEntityPrefabs {
    static types = new Map<number, (model: Entity) => void>()

    static setupEntity(model: Entity) {
        model.addComponent(new EntityDataTransmitComponent())
        model.addComponent(new EntityStateTransmitComponent())
    }
}