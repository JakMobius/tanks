import { Commands } from "src/entity/components/network/commands"
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component"
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component"
import SpawnzoneComponent from "../spawnzone-component"

export default class SpawnzoneReceiver extends ReceiverComponent {
    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.SPAWNZONE_DATA_COMMAND, (buffer) => {
            let spawnzone = this.entity.getComponent(SpawnzoneComponent)
            spawnzone.setTeam(buffer.readInt32())
            spawnzone.setSpawnAngle(buffer.readFloat32())
        })
    }
}