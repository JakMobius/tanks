import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import CollisionIgnoreList from "src/entity/components/collision-ignore-list";

export default class CollisionIgnoreListReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.COLLISION_IGNORE_LIST_REMOVE, (buffer) => {
            let entity = receiveComponent.readEntity(buffer)
            CollisionIgnoreList.enableCollisions(this.entity, entity)
        })

        receiveComponent.commandHandlers.set(Commands.COLLISION_IGNORE_LIST_ADD, (buffer) => {
            let entity = receiveComponent.readEntity(buffer)
            CollisionIgnoreList.ignoreCollisions(this.entity, entity)
        })
    }
}