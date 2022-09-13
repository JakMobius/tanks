import ReceiverComponent from "../receiving/receiver-component";
import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";

export default class GameModeEventReceiver extends ReceiverComponent {
    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.GAME_STATE_COMMAND, (buffer) => {
            this.entity.emit("game-state-update", this.readObject(buffer))
        })
    }
}