
import BasicEventHandlerSet from "../../../../utils/basic-event-handler-set";
import {TransmitterSet} from "./transmitter-set";
import WriteBuffer from "../../../../serialization/binary/write-buffer";
import Entity from "../../../../utils/ecs/entity";
import EntityDataTransmitComponent from "./entity-data-transmit-component";

export class Transmitter {
    set: TransmitterSet | null = null
    eventHandler = new BasicEventHandlerSet()

    pack(command: number, callback: (buffer: WriteBuffer) => void) {
        this.set.receivingEnd.packCommand(this.set, command, callback)
    }

    pointToEntity(entity: Entity) {
        let component = entity.getComponent(EntityDataTransmitComponent)
        let transmitterSet = component.getTransmitterSet(this.set.receivingEnd)
        this.set.receivingEnd.packNavigationPath(transmitterSet)
    }

    attachToSet(set: TransmitterSet): void {
        this.set = set
        this.eventHandler.setTarget(set.transmitComponent.entity)
        if(set.isAttachedToRoot()) {
            this.attachedToRoot()
        }
    }

    detachFromSet() {
        if(this.set.isAttachedToRoot()) {
            this.detachedFromRoot()
        }

        this.set = null
        this.eventHandler.setTarget(null)
    }

    getEntity() {
        return this.set.transmitComponent.entity
    }

    attachedToRoot() {

    }

    detachedFromRoot() {

    }
}