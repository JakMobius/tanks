import WriteBuffer from "src/serialization/binary/write-buffer";
import Entity from "src/utils/ecs/entity";
import {TransmitterSet} from "./transmitter-set";
import EntityDataTransmitComponent from "./entity-data-transmit-component";
import BinaryBlockCoder from "src/serialization/binary/parsers/binary-block-coder";
import EventEmitter from "src/utils/event-emitter";

export class ReceivingEnd extends EventEmitter {
    buffer = new WriteBuffer()
    root: Entity

    hasData() {
        return this.buffer.offset > 0
    }

    reset() {
        this.buffer.reset()
        this.buffer.writeInt32(-1)
    }

    setRoot(root: Entity) {
        if(this.root) {
            this.root.getComponent(EntityDataTransmitComponent).detachReceivingEnd(this)
        }
        this.root = root
        if(this.root) {
            this.root.getComponent(EntityDataTransmitComponent).attachReceivingEnd(this)
        }
        this.reset()
    }

    spitBuffer() {
        let endPosition = this.buffer.offset
        this.buffer.offset = 0
        this.buffer.writeUint32(endPosition)
        this.buffer.offset = endPosition

        let buffer = this.buffer.spitBuffer()
        this.reset()
        return buffer
    }

    packCommand(transmitterSet: TransmitterSet, command: number, callback: (buffer: WriteBuffer) => void) {
        this.buffer.writeUint32(transmitterSet.entityId)

        BinaryBlockCoder.encodeBlock(this.buffer, () => {
            this.buffer.writeUint16(command)
            callback(this.buffer)
        });
    }
}