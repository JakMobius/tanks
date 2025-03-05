import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";

export default class VisibilityInheritanceComponent extends EventHandlerComponent {

    parentEventHandler = new BasicEventHandlerSet()

    constructor() {
        super();

        this.parentEventHandler.on("transmitter-set-added", (set: TransmitterSet) => {
            this.entity.getComponent(EntityDataTransmitComponent).createTransmitterSetFor(set.receivingEnd)
        })

        this.parentEventHandler.on("transmitter-set-removed", (set: TransmitterSet) => {
            this.entity.getComponent(EntityDataTransmitComponent).removeTransmitterSetFor(set.receivingEnd)
        })

        this.eventHandler.on("detached-from-parent", () => {
            this.entity.getComponent(EntityDataTransmitComponent).clearTransmitterSets()
            this.parentEventHandler.setTarget(null)
        })

        this.eventHandler.on("attached-to-parent", (parent) => {
            this.inheritTransmitterSets()
            this.parentEventHandler.setTarget(parent)
        })
    }

    private inheritTransmitterSets() {
        let parent = this.entity.parent
        let parentTransmitComponent = parent?.getComponent(EntityDataTransmitComponent)
        let transmitComponent = this.entity.getComponent(EntityDataTransmitComponent)

        if(!parentTransmitComponent || !transmitComponent) return

        for (let end of parentTransmitComponent.transmitterSets.keys()) {
            transmitComponent.createTransmitterSetFor(end)
        }
    }
}