import EntityDataReceiveComponent from "../entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import ServerPosition from "../../../../client/entity/server-position";

export default class PositionReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {

        receiveComponent.commandHandlers.set(Commands.POSITION_UPDATE_COMMAND, (buffer) => {
            const x = buffer.readFloat32()
            const y = buffer.readFloat32()
            const angle = buffer.readFloat32()
            const vx = buffer.readFloat32()
            const vy = buffer.readFloat32()
            const angularVelocity = buffer.readFloat32()

            const serverPosition = this.entity.getComponent(ServerPosition)

            serverPosition.serverVelocity.x = vx
            serverPosition.serverVelocity.y = vy

            serverPosition.serverPosition.x = x
            serverPosition.serverPosition.y = y

            serverPosition.serverAngle = angle
            serverPosition.serverAngularVelocity = angularVelocity

            serverPosition.serverPositionReceived()
        })
    }
}