import ReadBuffer from "src/serialization/binary/read-buffer";
import BinaryBlockCoder from "src/serialization/binary/parsers/binary-block-coder";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import EntityIdTable from "src/entity/components/network/entity-id-table";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import GameObjectReader from "src/entity/components/network/receiving/game-object-reader";
import {commandName} from "src/entity/components/network/commands";
import WriteBuffer from "src/serialization/binary/write-buffer";
import WorldDataPacket from "src/networking/packets/game-packets/world-data-packet";
import { getPrefabNameForEntity } from "../../prefab-id-component";

export class EntityDataRecieveContext {
    idTable = new EntityIdTable()
    entityFactory?: (id: string, entity: Entity) => void

    constructor(factory: (id: string, entity: Entity) => void) {
        this.entityFactory = factory
    }
}

export default class EntityDataReceiveComponent extends EventHandlerComponent {

    commandHandlers = new Map<number, (buffer: ReadBuffer) => void>()
    entityId: number

    private parentEventHandler = new BasicEventHandlerSet()
    private context: EntityDataRecieveContext | null = null
    root: EntityDataReceiveComponent | null = null

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

    receivePacket(packet: WorldDataPacket) {
        this.receiveBuffer(new ReadBuffer(packet.buffer.buffer))
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

    makeRoot(entityFactory: (id: string, entity: Entity) => void) {
        this.context = new EntityDataRecieveContext(entityFactory)
        this.updateRoot()
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

        return this.root.context.idTable.getEntityFor(index)
    }

    readObject(buffer: ReadBuffer): any {
        return GameObjectReader.instance.readWithReceiver(buffer, this)
    }

    private updateRoot() {
        let oldRoot = this.root
        this.parentEventHandler.setTarget(this.entity?.parent)

        if(this.context) {
            this.root = this
        } else {
            this.root = this.entity.parent?.getComponent(EntityDataReceiveComponent).root
        }

        if(this.root !== oldRoot) {
            oldRoot?.context?.idTable.removeId(this.entityId)
        }
        this.root?.context?.idTable.setEntityId(this.entity, this.entityId)
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        this.updateRoot()
    }

    getContext() {
        return this.root.context
    }

    private handleCommand(command: number, buffer: ReadBuffer) {
        let handler = this.commandHandlers.get(command)
        if (!handler) {
            console.error("EntityDataReceiveComponent received unknown command 0x" + command.toString(16) + " for entity " + getPrefabNameForEntity(this.entity), this)
            return
        }

        this.commandHandlers.get(command)(buffer)
    }
}