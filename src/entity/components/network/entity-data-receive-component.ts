import BlockTreeDecoder from "../../../networking/block-tree-decoder";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import HierarchicalComponent from "../hierarchical-component";
import {Commands} from "./commands";

export default class EntityDataReceiveComponent extends HierarchicalComponent {

    commandHandlers = new Map<number, (buffer: ReadBuffer) => void>()
    mappedChildren = new Map<number, EntityDataReceiveComponent>()
    networkIdentifier: number | null = null

    constructor(identifier: number | null = null) {
        super();
        this.networkIdentifier = identifier
    }

    childComponentAdded(component: EntityDataReceiveComponent) {
        if (!Number.isInteger(component.networkIdentifier)) {
            throw new Error("Only root receiver component may have null identifier")
        }
        this.mappedChildren.set(component.networkIdentifier, component)
    }

    childComponentDetached(component: EntityDataReceiveComponent) {
        this.mappedChildren.delete(component.networkIdentifier)
    }

    receiveBuffer(buffer: ReadBuffer) {
        BlockTreeDecoder.forEachNodeChildren(buffer, (buffer, size) => {
            this.receiveCommand(buffer)
        })
    }

    receiveCommand(buffer: ReadBuffer) {
        let command = buffer.readUint16()

        if(command == Commands.PASS_BLOCK_TO_CHILD) {
            let childIndex = buffer.readUint32()
            let children = this.mappedChildren.get(childIndex)
            if(!children) {
                console.error("ReceiverComponent has failed to pass network buffer to child entity with id=" + childIndex, this)
                return
            }

            children.receiveBuffer(buffer)
            return
        }

        let handler = this.commandHandlers.get(command)
        if(!handler) {
            console.error("ReceiverComponent received unknown command: " + command, this)
            return
        }

        handler(buffer)
    }
}