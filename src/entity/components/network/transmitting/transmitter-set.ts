import Transmitter from "./transmitter";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import {ReceivingEnd} from "./receiving-end";
import {Constructor} from "src/utils/constructor";
import EventEmitter from "src/utils/event-emitter";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import EntityIdTable from "src/entity/components/network/entity-id-table";
import ReadBuffer from "src/serialization/binary/read-buffer";
import Entity from "src/utils/ecs/entity";

export class TransmitterSet extends EventEmitter {
    transmitters: Transmitter[] = []
    // TODO: Get rid
    transmitterMap = new Map<Constructor<Transmitter>, Transmitter>
    messageHandlers = new Map<number, Array<(entity: Entity, buffer: ReadBuffer, size: number) => void>>
    transmitComponent: EntityDataTransmitComponent | null = null
    receivingEnd: ReceivingEnd
    entityId: number | null = null
    private idTable: EntityIdTable = null
    private parentEventHandler = new BasicEventHandlerSet()

    constructor(end: ReceivingEnd) {
        super()
        this.receivingEnd = end
    }

    initializeTransmitter<Args extends Array<any>, T extends Transmitter>(TransmitterClass: {
        new(...args: Args): T
    }, ...args: Args) {
        let transmitter = new TransmitterClass(...args)
        this.transmitterMap.set(TransmitterClass, transmitter)
        this.attachTransmitter(transmitter)
    }

    attachTransmitter(transmitter: Transmitter) {
        transmitter.attachToSet(this)
        this.transmitters.push(transmitter)
    }

    getTransmitter<TransmitterType extends Transmitter>(TransmitterClass: Constructor<TransmitterType>): TransmitterType | null {
        return this.transmitterMap.get(TransmitterClass) as TransmitterType | null
    }

    handleResponse(command: number, player: Entity, buffer: ReadBuffer, size: number) {
        let handlers = this.messageHandlers.get(command)
        if(!handlers) return
        let index = buffer.offset
        for(let handler of handlers) {
            buffer.offset = index
            handler(player, buffer, size)
        }
    }

    updateParent() {
        if (this.transmitComponent?.ends?.has(this.receivingEnd)) {
            if (!this.idTable) {
                this.setIdTable(new EntityIdTable())
            }
            this.parentEventHandler.setTarget(null)
            return
        }

        let parent = this.transmitComponent?.entity?.parent
        let parentTransmitComponent = parent?.getComponent(EntityDataTransmitComponent)
        let parentTransmitterSet = parentTransmitComponent?.transmitterSetFor(this.receivingEnd) ?? null
        this.parentEventHandler.setTarget(parentTransmitterSet)

        let idTable = parentTransmitterSet?.getIdTable() ?? null

        this.setIdTable(idTable)
    }

    setIdTable(idTable: EntityIdTable) {
        if (idTable === this.idTable) return

        if (this.idTable) {
            if (this.entityId !== null) {
                this.idTable.removeId(this.entityId)
                this.entityId = null
            }
            this.idTable = null
            this.detachedFromRoot()
        }

        if (idTable) {
            this.idTable = idTable
            if (this.entityId === null) {
                this.entityId = this.idTable.getNewId(this.transmitComponent.entity)
            }
            this.attachedToRoot()
        }
    }

    attachedToRoot() {
        for (let transmitter of this.transmitters) {
            transmitter.attachedToRoot()
        }

        for (let child of this.transmitComponent.entity.children) {
            child.getComponent(EntityDataTransmitComponent)?.transmitterSetFor(this.receivingEnd)?.updateParent()
        }

        this.receivingEnd.emit("transmitter-set-attached", this)
    }

    detachedFromRoot() {
        for (let child of this.transmitComponent.entity.children) {
            child.getComponent(EntityDataTransmitComponent)?.transmitterSetFor(this.receivingEnd)?.updateParent()
        }

        for (let transmitter of this.transmitters) {
            transmitter.detachedFromRoot()
        }

        this.receivingEnd.emit("transmitter-set-detached", this)
    }

    getIdTable() {
        if (!this.isAttachedToRoot()) {
            return null
        }
        return this.idTable
    }

    isAttachedToRoot() {
        return this.entityId !== null
    }
}
