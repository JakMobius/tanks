
import EntityDataReceiveComponent from "../entity-data-receive-component";
import PhysicalComponent from "../../physics-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import ServerPosition from "../../../../client/entity/server-position";
import HealthComponent from "../../health-component";

export default class HealthReceiverComponent extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.HEALTH_UPDATE_COMMAND, (buffer) => {
            this.entity.getComponent(HealthComponent).setHealth(buffer.readFloat32())
        })
    }
}