import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import Entity from "src/utils/ecs/entity";

export default class PrimaryPlayerReceiver extends ReceiverComponent {
    primaryEntity: Entity | null = null

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.PLAYER_TANK_SET, (buffer) => {
            let exists = buffer.readUint8()
            let entity = exists ? receiveComponent.readEntity(buffer) : null
            this.primaryEntity = entity
            this.entity.emit("primary-entity-set", entity)
        })
    }
}