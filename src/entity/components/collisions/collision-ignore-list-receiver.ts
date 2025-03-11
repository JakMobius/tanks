
import CollisionIgnoreList from "src/entity/components/collisions/collision-ignore-list";
import ReceiverComponent from "../network/receiving/receiver-component";
import EntityDataReceiveComponent from "../network/receiving/entity-data-receive-component";
import { Commands } from "../network/commands";

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