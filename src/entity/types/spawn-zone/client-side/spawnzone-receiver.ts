import { Commands } from "src/entity/components/network/commands"
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component"
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component"
import SpawnzoneComponent from "../spawnzone-component"

export default class SpawnzoneReceiver extends ReceiverComponent {
    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.SPAWNZONE_TEAM_SET_COMMAND, (buffer) => {
            this.entity.getComponent(SpawnzoneComponent).setTeam(buffer.readInt32())
        })
    }
}