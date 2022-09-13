import {TransmitterSet} from "../../../entity/components/network/transmitting/transmitter-set";
import EntityStateTransmitter from "../../../entity/components/network/entity/entity-state-transmitter";
import {Component} from "../../../utils/ecs/component";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import Entity from "../../../utils/ecs/entity";

export default class EntityStateTransmitComponent implements Component {

    entity: Entity | null = null
    private eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.eventHandler.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(EntityStateTransmitter)
        })
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}