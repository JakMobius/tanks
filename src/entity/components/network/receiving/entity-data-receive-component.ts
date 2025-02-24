import ReadBuffer from "src/serialization/binary/read-buffer";
import BinaryBlockCoder from "src/serialization/binary/parsers/binary-block-coder";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import EntityIdTable from "src/entity/components/network/entity-id-table";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import GameObjectReader from "src/entity/components/network/receiving/game-object-reader";
import {commandName} from "src/entity/components/network/commands";
import WriteBuffer from "src/serialization/binary/write-buffer";

export default class EntityDataReceiveComponent extends EventHandlerComponent {

    commandHandlers = new Map<number, (buffer: ReadBuffer) => void>()
    entityId: number

    private parentEventHandler = new BasicEventHandlerSet()
    private entityIdTable: EntityIdTable | null = null
    private root: EntityDataReceiveComponent | null = null

    constructor(identifier: number) {
        super();
        this.entityId = identifier

        this.eventHandler.on("attached-to-parent", (parent) => {
            this.updateRoot()
        })

        this.parentEventHandler.on("root-update", () => {
            this.updateRoot()
        })
    }

    receiveBuffer(buffer: ReadBuffer) {
        BinaryBlockCoder.decodeBlock(buffer, (buffer, size) => {
            let end = buffer.offset + size
            while (buffer.offset < end) {
                let entityId = buffer.readUint32()
                BinaryBlockCoder.decodeBlock(buffer, () => {
                    let command = buffer.readUint16()
                    let entity = this.getEntityById(entityId)
                    if (entity) {
                        entity.getComponent(EntityDataReceiveComponent).handleCommand(command, buffer)
                    } else {
                        console.error("Command " + commandName(command) + " is received for an unknown entity id " + entityId)
                    }
                });
            }
        })
    }

    makeRoot(root: boolean) {
        if (root && !this.entityIdTable) {
            this.entityIdTable = new EntityIdTable()
            this.updateRoot()
        } else if(!root) {
            this.entityIdTable = null
            this.updateRoot()
        }
        return this
    }

    sendResponse(command: number, callback: (buffer: WriteBuffer) => void) {
        let buffer = new WriteBuffer()
        BinaryBlockCoder.encodeBlock(buffer, (buffer) => {
            buffer.writeInt32(this.entityId)
            BinaryBlockCoder.encodeBlock(buffer, (buffer) => {
                buffer.writeInt16(command)
                callback(buffer)
            })
        })
        this.root?.entity.emit("response", buffer)
    }
    
    readEntity(buffer: ReadBuffer) {
        return this.getEntityById(buffer.readUint32())
    }

    getEntityById(index: number): Entity {
        if (!this.root) {
            throw new Error("EntityDataReceiveComponent.readEntity called without a valid root receive component")
        }

        return this.root.entityIdTable.getEntityFor(index)
    }

    readObject(buffer: ReadBuffer): any {
        return GameObjectReader.instance.readWithReceiver(buffer, this)
    }

    private updateRoot() {
        let oldRoot = this.root
        this.parentEventHandler.setTarget(this.entity?.parent)

        if(this.entityIdTable) {
            this.root = this
        } else {
            this.root = this.entity.parent?.getComponent(EntityDataReceiveComponent).root
        }

        if(this.root !== oldRoot) {
            oldRoot?.entityIdTable?.removeId(this.entityId)
        }
        this.root?.entityIdTable?.setEntityId(this.entity, this.entityId)
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        this.updateRoot()
    }

    private handleCommand(command: number, buffer: ReadBuffer) {
        let handler = this.commandHandlers.get(command)
        if (!handler) {
            console.error("ReceiverComponent received unknown command: " + command, this)
            return
        }

        this.commandHandlers.get(command)(buffer)
    }
}