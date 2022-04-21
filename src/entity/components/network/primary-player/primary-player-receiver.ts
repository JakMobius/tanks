
import EntityDataReceiveComponent from "../entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import Entity from "../../../../utils/ecs/entity";

export default class PrimaryPlayerReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.PLAYER_TANK_SET, (buffer) => {
            let exists = buffer.readUint8()
            let entity: Entity | null = null
            if(exists) entity = EntityDataReceiveComponent.performNavigation(buffer, this.entity)
            this.entity.emit("primary-entity-set", entity)
        })
    }
}