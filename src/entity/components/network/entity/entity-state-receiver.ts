
import EntityDataReceiveComponent from "../entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import ClientEntity from "../../../../client/entity/client-entity";
import EntityModel from "../../../entity-model";

export default class EntityStateReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.ENTITY_CREATE_COMMAND, (buffer) => {
            let identifier = buffer.readUint32()
            let newEntity = new EntityModel()

            let configuration = buffer.readUint32()

            newEntity.addComponent(new EntityDataReceiveComponent(identifier))

            if(configuration > 0) {
                let configurationScript = ClientEntity.types.get(configuration)
                if(!configurationScript) {
                    console.error("Attempt to configure entity with an unknown script id: " + configuration)
                } else {
                    configurationScript(newEntity)
                }
            }

            this.entity.appendChild(newEntity)
        })

        receiveComponent.commandHandlers.set(Commands.ENTITY_REMOVE_COMMAND, (buffer) => {
            this.entity.removeFromParent()
        })
    }
}