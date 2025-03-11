
import HealthComponent from "src/entity/components/health/health-component";
import ReceiverComponent from "../network/receiving/receiver-component";
import EntityDataReceiveComponent from "../network/receiving/entity-data-receive-component";
import { Commands } from "../network/commands";

export default class HealthReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
            this.entity.getComponent(HealthComponent).setHealth(buffer.readFloat32())
        })
    }
}