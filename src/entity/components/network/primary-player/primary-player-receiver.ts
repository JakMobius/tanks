import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";

export default class PrimaryPlayerReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.PLAYER_TANK_SET, (buffer) => {
            let exists = buffer.readUint8()
            let entity = exists ? this.readEntity(buffer) : null
            this.entity.emit("primary-entity-set", entity)
        })
    }
}