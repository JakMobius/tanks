import ReceiverComponent from "../receiving/receiver-component";
import {Commands} from "../commands";
import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";

export interface EntityPilotData {
    nick: string
    teamId: number | null
}

export default class EntityPilotListReceiver extends ReceiverComponent {
    pilotList: EntityPilotData[] = []

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.ENTITY_PILOT_LIST_COMMAND, (buffer) => {
            let count = buffer.readUint16()
            this.pilotList = []
            for (let i = 0; i < count; i++) {
                let nick = buffer.readString()
                let teamId = buffer.readInt16()

                this.pilotList.push({
                    nick: nick,
                    teamId: teamId
                })
            }
            this.entity.emit("pilot-list-received")
        })
    }
}