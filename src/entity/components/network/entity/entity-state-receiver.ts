import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import Entity from "src/utils/ecs/entity";

export default class EntityStateReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.ENTITY_CREATE_COMMAND, (buffer) => {
            let identifier = buffer.readUint32()
            let newEntity = new Entity()

            let configuration = buffer.readUint32()

            newEntity.addComponent(new EntityDataReceiveComponent(identifier))

            if(configuration > 0) {
                let configurationScript = ClientEntityPrefabs.types.get(configuration)
                if(!configurationScript) {
                    console.error("Attempt to configure entity with an unknown script id: " + configuration)
                } else {
                    configurationScript(newEntity)
                }
            }

            this.entity.appendChild(newEntity)
        })

        receiveComponent.commandHandlers.set(Commands.ENTITY_REMOVE_COMMAND, () => {
            this.entity.removeFromParent()
        })
    }
}