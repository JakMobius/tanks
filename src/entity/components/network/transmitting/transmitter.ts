import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import {TransmitterSet} from "./transmitter-set";
import WriteBuffer from "src/serialization/binary/write-buffer";
import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import GameObjectWriter from "../receiving/game-object-writer";
import TransmitterPrecondition from "./precondition/transmitter-precondition";
import ReadBuffer from "src/serialization/binary/read-buffer";

export default class Transmitter {
    set: TransmitterSet | null = null
    eventHandler = new BasicEventHandlerSet()
    protected transmitterPrecondition: TransmitterPrecondition | null = null
    enabled = false

    addResponseHandler(command: number, callback: (buffer: ReadBuffer, size: number) => void) {
        let currentHandlers = this.set.messageHandlers.get(command)
        if(!currentHandlers) {
            currentHandlers = []
            this.set.messageHandlers.set(command, currentHandlers)
        }
        currentHandlers.push(callback)
    }

    packIfEnabled(command: number, callback: (buffer: WriteBuffer) => void) {
        if(!this.enabled) return
        this.set.receivingEnd.packCommand(this.set, command, callback)
    }

    entityCanBePointed(entity: Entity) {
        let component = entity.getComponent(EntityDataTransmitComponent)
        let transmitterSet = component.transmitterSetFor(this.set.receivingEnd)
        return transmitterSet && transmitterSet.isAttachedToRoot()
    }

    pointToEntity(entity: Entity) {
        let component = entity.getComponent(EntityDataTransmitComponent)
        if(!component) {
            throw new Error("Entity does not have a transmit component")
        }

        let transmitterSet = component.transmitterSetFor(this.set.receivingEnd)
        if(!transmitterSet) {
            throw new Error("Entity is not visible to the receiver")
        }

        this.set.receivingEnd.buffer.writeUint32(transmitterSet.entityId)
    }

    attachToSet(set: TransmitterSet): void {
        this.set = set
        if(set.isAttachedToRoot()) {
            this.attachedToRoot()
        }
    }

    getEntity() {
        return this.set.transmitComponent.entity
    }

    attachedToRoot() {
        this.updatePrecondition()
        if(!this.transmitterPrecondition) this.onEnable()
        else {
            this.transmitterPrecondition.transmitterAttachedToRoot()
        }
        this.eventHandler.setTarget(this.set.transmitComponent.entity)
    }

    willDetachFromRoot() {
        this.eventHandler.setTarget(null)
        if(this.enabled) {
            this.onDisable()
        }
    }

    detachedFromRoot() {
        if(this.transmitterPrecondition) {
            this.transmitterPrecondition.transmitterDetachedFromRoot()
        }
    }

    // This method is called when transmitter is attached to the root of the tree,
    // but before the precondition gets an opportunity to check if it should be enabled.
    // It should be used to set up precondition with any kind of data that is needed
    // This method can also be called from user code
    updatePrecondition() {

    }

    onEnable() {
        this.enabled = true
    }

    onDisable() {
        this.enabled = false
    }

    encodeObject(object: any) {
        GameObjectWriter.instance.writeWithTransmitter(object, this)
    }
}