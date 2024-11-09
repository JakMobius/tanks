import ReceiverComponent from "../receiving/receiver-component";
import {Commands} from "../commands";
import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";

export interface EntityPilotData {
    nick: string
    teamId: number | null
}

export default class EntityPilotReceiver extends ReceiverComponent {
    pilot: EntityPilotData | null = null

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.ENTITY_PILOT_LIST_COMMAND, (buffer) => {
            if(buffer.readInt8() == 1) {
                let nick = buffer.readString()
                let teamId = buffer.readInt16()

                this.pilot = {
                    nick: nick,
                    teamId: teamId
                }
            } else {
                this.pilot = null
            }

            this.entity.emit("pilot-received")
        })
    }
}