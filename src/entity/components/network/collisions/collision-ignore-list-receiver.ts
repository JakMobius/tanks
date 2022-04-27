import EntityDataReceiveComponent from "../entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import CollisionIgnoreList from "../../collision-ignore-list";

export default class CollisionIgnoreListReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.COLLISION_IGNORE_LIST_REMOVE, (buffer) => {
            let entity = EntityDataReceiveComponent.performNavigation(buffer, this.entity)
            CollisionIgnoreList.enableCollisions(this.entity, entity)
        })

        receiveComponent.commandHandlers.set(Commands.COLLISION_IGNORE_LIST_ADD, (buffer) => {
            let entity = EntityDataReceiveComponent.performNavigation(buffer, this.entity)
            CollisionIgnoreList.ignoreCollisions(this.entity, entity)
        })
    }
}