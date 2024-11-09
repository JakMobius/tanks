import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import CollisionDisableComponent from "src/entity/components/collision-disable";

export default class CollisionDisableReceiver extends ReceiverComponent {
    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.COLLISION_DISABLE_COMMAND, (buffer) => {
            this.entity.getComponent(CollisionDisableComponent).setCollisionsDisabled(buffer.readInt8() === 1)
        })
    }
}