
import BasicEventHandlerSet from "../../../../utils/basic-event-handler-set";
import {TransmitterSet} from "./transmitter-set";
import WriteBuffer from "../../../../serialization/binary/write-buffer";

export class Transmitter {
    set: TransmitterSet | null = null
    eventHandler = new BasicEventHandlerSet()

    pack(command: number, callback: (buffer: WriteBuffer) => void) {
        this.set.receivingEnd.packCommand(this.set, command, callback)
    }

    attachToSet(set: TransmitterSet): void {
        this.set = set
        this.eventHandler.setTarget(set.transmitComponent.entity)
    }

    detachFromSet() {
        this.set = null
        this.eventHandler.setTarget(null)
    }

    getEntity() {
        return this.set.transmitComponent.entity
    }
}