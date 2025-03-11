import { Commands } from "src/entity/components/network/commands"
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component"
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component"

export default class CheckpointReceiver extends ReceiverComponent {
    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.CHECKPOINT_DATA_COMMAND, (buffer) => {
            
        })
    }
}