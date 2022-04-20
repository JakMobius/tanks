import Entity from "../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import EntityDataTransmitComponent, {TransmitContext} from "./entity-data-transmit-component";

export class TransmitterComponent {
    entity: Entity | null;
    eventHandler = new BasicEventHandlerSet()
    queue: Array<(context: TransmitContext) => void> = []

    constructor() {
        this.eventHandler.on("data-pack", (context: TransmitContext) => {
            for(let action of this.queue) action(context)
            this.queue = []
        })
    }

    onPack(callback: (context: TransmitContext) => void) {
        this.entity.getComponent(EntityDataTransmitComponent).setNeedsPack()
        this.queue.push(callback)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(this.entity)
    }
}