
import ReadBuffer from "../../../serialization/binary/read-buffer";
import HierarchicalComponent from "../hierarchical-component";
import BinaryBlockCoder from "../../../serialization/binary/parsers/binary-block-coder";
import Entity from "../../../utils/ecs/entity";

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
        BinaryBlockCoder.decodeBlock(buffer, (buffer, size) => {
            let entity = this.entity
            let end = buffer.offset + size
            while(buffer.offset < end) {
                entity = EntityDataReceiveComponent.performNavigation(buffer, entity)
                let component = entity.getComponent(EntityDataReceiveComponent)
                component.parseCommand(buffer)
            }
        })
    }

    private static performNavigation(buffer: ReadBuffer, entity: Entity): Entity {
        let offset = buffer.offset
        let ascendCount = buffer.readUint16()
        while(ascendCount--) {
            entity = entity.parent
        }
        let descentWayLength = buffer.readUint16()
        while(descentWayLength--) {
            let childIndex = buffer.readUint32()
            let component = entity.getComponent(EntityDataReceiveComponent)
            let child = component.mappedChildren.get(childIndex)
            if (!child) {
                console.error("ReceiverComponent has failed to navigate to child entity with id=" + childIndex, entity)
                return null
            }
            entity = child.entity
        }

        return entity
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
}