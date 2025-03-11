import { Commands } from "src/entity/components/network/commands";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";

export default class FlagStateReceiver extends ReceiverComponent {
    teamId: number | null = null

    hook(component: EntityDataReceiveComponent): void {
        component.commandHandlers.set(Commands.FLAG_DATA_COMMAND, (buffer) => {
            this.setTeam(buffer.readInt8())
        })
    }

    setTeam(teamId: number) {
        this.teamId = teamId
        this.entity.emit("team-set")
    }
}