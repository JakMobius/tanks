import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import {UserMessageType} from "src/entity/components/network/event/user-message";
import ReadBuffer from "src/serialization/binary/read-buffer";
import TankChangeEventView from "src/client/ui/events-hud/types/tank-change-event-view";
import Entity from "src/utils/ecs/entity";
import SelfDestructEventView from "src/client/ui/events-hud/types/self-destruct-event-view";

export default class UserMessageReceiver extends ReceiverComponent {

    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.USER_MESSAGE_COMMAND, (buffer) => {
            let message: UserMessageType = buffer.readInt16()

            switch(message) {
                case UserMessageType.tankChangeOnRespawnMessage:
                    this.handleTankChangeOnRespawnMessage(buffer)
                    break
                case UserMessageType.selfDestructMessage:
                    this.handleSelfDestructMessage(buffer)
                    break
                case UserMessageType.chooseTank:
                    this.handleChooseTankMessage()
                    break;
            }
        })
    }

    private handleTankChangeOnRespawnMessage(buffer: ReadBuffer) {
        let tankId = buffer.readInt16()

        this.entity.emit("event-view", TankChangeEventView, { newTank: tankId })
    }

    private handleSelfDestructMessage(buffer: ReadBuffer) {
        let isSelfDestruct = buffer.readInt8()
        let timer: Entity | null = isSelfDestruct ? this.receiveComponent.readEntity(buffer) : null

        this.entity.emit("event-view", SelfDestructEventView, { timer })
    }

    private handleChooseTankMessage() {
        // TODO: maybe there is some better way to do this
        this.entity.emit("choose-tank")
    }
}