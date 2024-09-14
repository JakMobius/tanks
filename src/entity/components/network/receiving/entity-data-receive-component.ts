import ReadBuffer from "src/serialization/binary/read-buffer";
import BinaryBlockCoder from "src/serialization/binary/parsers/binary-block-coder";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import EntityIdTable from "src/entity/components/network/entity-id-table";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import GameObjectReader from "src/entity/components/network/receiving/game-object-reader";
import {commandName, Commands} from "src/entity/components/network/commands";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

export default class EntityDataReceiveComponent extends EventHandlerComponent {

    commandHandlers = new Map<number, (buffer: ReadBuffer) => void>()
    networkIdentifier: number

    private parentEventHandler = new BasicEventHandlerSet()
    private entityIdTable: EntityIdTable | null = null
    private parentTable: EntityIdTable | null = null
    private resolvedTable: EntityIdTable | null = null

    constructor(identifier: number) {
        super();
        this.networkIdentifier = identifier

        this.eventHandler.on("attached-to-parent", (parent) => {
            this.updateParentTable()
        })

        this.parentEventHandler.on("entity-table-update", () => {
            this.updateParentTable()
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

    private parseCommand(buffer: ReadBuffer) {
        BinaryBlockCoder.decodeBlock(buffer, () => {
            let command = buffer.readUint16()

            let handler = this.commandHandlers.get(command)
            if (!handler) {
                console.error("ReceiverComponent received unknown command: " + command, this)
                return
            }

            handler(buffer)
        });
    }

    private updateTable() {
        let oldEntityTable = this.resolvedTable

        if (!this.entity) {
            this.resolvedTable = null
        } else if (this.entityIdTable) {
            this.resolvedTable = this.entityIdTable
        } else {
            this.resolvedTable = this.parentTable
        }

        if (oldEntityTable !== this.resolvedTable) {
            oldEntityTable?.removeId(this.networkIdentifier)
            this.entity?.emit("entity-table-update")
            this.resolvedTable?.setEntityId(this.entity, this.networkIdentifier)
        }
    }

    makeRoot(root: boolean) {
        if (root && !this.entityIdTable) {
            this.entityIdTable = new EntityIdTable()
            this.updateTable()
        } else if (!root && this.entityIdTable) {
            this.entityIdTable = null
            this.updateTable()
        }
        return this
    }

    getEntityTable() {

    }

    readEntity(buffer: ReadBuffer) {
        return this.getEntityById(buffer.readUint32())
    }

    getEntityById(index: number): Entity {
        if (!this.resolvedTable) {
            throw new Error("EntityDataReceiveComponent.readEntity called without a valid root receive component")
        }

        return this.resolvedTable.getEntityFor(index)
    }

    readObject(buffer: ReadBuffer): any {
        return GameObjectReader.instance.readWithReceiver(buffer, this)
    }

    private updateParentTable() {
        this.parentEventHandler.setTarget(this.entity?.parent)
        this.parentTable = this.entity?.parent?.getComponent(EntityDataReceiveComponent).resolvedTable ?? null
        this.updateTable()
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);

        this.updateParentTable()
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