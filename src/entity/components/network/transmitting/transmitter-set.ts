import Transmitter from "./transmitter";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import {ReceivingEnd} from "./receiving-end";
import {Constructor} from "src/utils/constructor";
import EventEmitter from "src/utils/event-emitter";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import EntityIdTable from "src/entity/components/network/entity-id-table";

export class TransmitterSet extends EventEmitter {
    transmitters: Transmitter[] = []
    // TODO: Get rid
    transmitterMap = new Map<Constructor<Transmitter>, Transmitter>
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
            this.detachedFromRoot()
        }

        this.idTable = idTable

        if (idTable) {
            this.attachedToRoot()
        }
    }

    attachedToRoot() {
        if (this.entityId === null) {
            this.entityId = this.idTable.getNewId(this.transmitComponent.entity)
        }

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

        if (this.entityId !== null) {
            this.idTable.removeId(this.entityId)
            this.entityId = null
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
