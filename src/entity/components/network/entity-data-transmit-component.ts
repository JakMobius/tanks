import HierarchicalComponent from "../hierarchical-component";
import WriteBuffer from "../../../serialization/binary/write-buffer";
import BinaryBlockCoder from "../../../serialization/binary/parsers/binary-block-coder";
import {Commands} from "./commands";

export class TransmitContext {
    buffer: WriteBuffer

    pack(command: number, pack: (buffer: WriteBuffer) => void) {
        BinaryBlockCoder.encodeBlock(this.buffer, () => {
            this.buffer.writeUint16(command)
            pack(this.buffer)
        });
    }
}

export default class EntityDataTransmitComponent extends HierarchicalComponent {
    mappedChildren = new Map<number, EntityDataTransmitComponent>()
    networkIdentifier: number | null = null
    hasData: boolean = false

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

    setNeedsPack() {
        this.hasData = true
        let parent = this.entity.parent
        if(!parent) return
        let parentComponent = parent.getComponent(EntityDataTransmitComponent)
        parentComponent.setNeedsPack()
    }

    hasAnythingToPack() {
        return this.hasData
    }

    packBuffer(context: TransmitContext) {
        this.hasData = false

        BinaryBlockCoder.encodeBlock(context.buffer, () => {
            this.entity.emit("data-pack", context)
            this.packChildrenBuffers(context);
        });
    }

    private packChildrenBuffers(context: TransmitContext) {
        for(let child of this.mappedChildren.entries()){
            if(!child[1].hasAnythingToPack()) continue;

            context.pack(Commands.PASS_BLOCK_TO_CHILD, (buffer) => {
                buffer.writeUint32(child[0])
                child[1].packBuffer(context)
            })
        }
    }
}