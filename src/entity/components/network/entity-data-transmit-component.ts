import HierarchicalComponent from "../hierarchical-component";
import WriteBuffer from "../../../serialization/binary/write-buffer";
import BinaryBlockCoder from "../../../serialization/binary/parsers/binary-block-coder";
import {Commands} from "./commands";
import {Transmitter} from "./transmitter";

export interface ReceivingEnd {}

export class TransmitContext {
    buffer: WriteBuffer
    end: ReceivingEnd

    pack(command: number, pack: (buffer: WriteBuffer) => void) {
        BinaryBlockCoder.encodeBlock(this.buffer, () => {
            this.buffer.writeUint16(command)
            pack(this.buffer)
        });
    }
}

export class TransmitterSet {
    transmitters = new Set<Transmitter>()
    hasData = false
    transmitComponent: EntityDataTransmitComponent | null = null
    receivingEnd: ReceivingEnd
}

export default class EntityDataTransmitComponent extends HierarchicalComponent {
    mappedChildren = new Map<number, EntityDataTransmitComponent>()
    transmitters = new Map<ReceivingEnd, TransmitterSet>()
    networkIdentifier: number | null = null

    constructor(identifier: number | null = null) {
        super();
        this.networkIdentifier = identifier
    }

    protected childComponentAdded(component: EntityDataTransmitComponent) {
        if (!Number.isInteger(component.networkIdentifier)) {
            throw new Error("Only root transmitter component may have null identifier")
        }
        this.mappedChildren.set(component.networkIdentifier, component)
    }

    protected childComponentDetached(component: EntityDataTransmitComponent) {
        this.mappedChildren.delete(component.networkIdentifier)
    }

    hasAnythingToPack(connection: ReceivingEnd) {
        let transmitters = this.transmitters.get(connection)
        if(transmitters) return transmitters.hasData
        return false;
    }

    packBuffer(context: TransmitContext) {
        BinaryBlockCoder.encodeBlock(context.buffer, () => {
            let ends = this.transmitters.get(context.end)

            if(ends) {
                for (let end of ends.transmitters) {
                    end.onPack(context)
                }
                ends.hasData = false
                this.clearTransmitterSetIfNecessary(context.end, ends)
            }

            this.packChildrenBuffers(context);
        });
    }

    private packChildrenBuffers(context: TransmitContext) {

        for(let child of this.mappedChildren.entries()){
            if(!child[1].hasAnythingToPack(context.end)) continue;

            context.pack(Commands.PASS_BLOCK_TO_CHILD, (buffer) => {
                buffer.writeUint32(child[0])
                child[1].packBuffer(context)
            })
        }
    }

    clearTransmitterSetIfNecessary(connection: ReceivingEnd, transmitters: TransmitterSet) {
        if(transmitters.transmitters.size || transmitters.hasData) return

        this.transmitters.delete(connection)
    }

    getTransmitterSet(connection: ReceivingEnd) {
        let transmitters = this.transmitters.get(connection)
        if(!transmitters) {
            transmitters = new TransmitterSet()
            transmitters.transmitComponent = this
            transmitters.receivingEnd = connection
            this.transmitters.set(connection, transmitters)
        }
        return transmitters
    }

    setHasData(connection: ReceivingEnd) {
        let set = this.getTransmitterSet(connection)
        if(set.hasData) return
        set.hasData = true
        let parent = this.entity.parent
        if(!parent) return
        let parentComponent = parent.getComponent(EntityDataTransmitComponent)
        if(!parentComponent) return
        parentComponent.setHasData(connection)
    }

    attachTransmitter(connection: ReceivingEnd, transmitter: Transmitter) {
        let set = this.getTransmitterSet(connection)
        transmitter.attachToSet(set)
        set.transmitters.add(transmitter)
    }

    detachTransmitters(connection: ReceivingEnd) {
        let transmitterSet = this.transmitters.get(connection)
        if (!transmitterSet) return;

        for (let transmitter of transmitterSet.transmitters) {
            transmitter.detachFromSet()
        }
        transmitterSet.transmitters.clear()
        this.clearTransmitterSetIfNecessary(connection, transmitterSet)
    }

    // TODO: Maybe it can be decomposed?

    detachTransmitter(connection: ReceivingEnd, transmitter: Transmitter) {
        let transmitterSet = this.transmitters.get(connection)
        if(!transmitterSet) return;
        if (!transmitterSet.transmitters.has(transmitter)) return;

        transmitter.detachFromSet()
        transmitterSet.transmitters.delete(transmitter)
        this.clearTransmitterSetIfNecessary(connection, transmitterSet)
    }
}