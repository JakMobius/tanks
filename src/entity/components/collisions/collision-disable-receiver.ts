import CollisionDisableComponent from "src/entity/components/collisions/collision-disable";
import ReceiverComponent from "../network/receiving/receiver-component";
import EntityDataReceiveComponent from "../network/receiving/entity-data-receive-component";
import { Commands } from "../network/commands";

export default class CollisionDisableReceiver extends ReceiverComponent {
    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.COLLISION_DISABLE_COMMAND, (buffer) => {
            this.entity.getComponent(CollisionDisableComponent).setCollisionsDisabled(buffer.readInt8() === 1)
        })
    }
}