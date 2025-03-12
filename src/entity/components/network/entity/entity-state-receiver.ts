import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import Entity from "src/utils/ecs/entity";

export default class EntityStateReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.ENTITY_CREATE_COMMAND, (buffer) => {
            let identifier = buffer.readUint32()
            
            let configuration = buffer.readString()
            let newEntity = new Entity()
            newEntity.addComponent(new EntityDataReceiveComponent(identifier))
            this.receiveComponent.root.getContext().entityFactory?.(configuration, newEntity)
            this.entity.appendChild(newEntity)
        })

        receiveComponent.commandHandlers.set(Commands.ENTITY_REMOVE_COMMAND, () => {
            this.entity.removeFromParent()
        })
    }
}