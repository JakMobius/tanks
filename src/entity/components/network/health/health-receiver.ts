import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import HealthComponent from "../../health-component";

export default class HealthReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
            this.entity.getComponent(HealthComponent).setHealth(buffer.readFloat32())
        })
    }
}