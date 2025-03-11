import Entity from "src/utils/ecs/entity";
import ReceiverComponent from "../network/receiving/receiver-component";
import EntityDataReceiveComponent from "../network/receiving/entity-data-receive-component";
import { Commands } from "../network/commands";

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