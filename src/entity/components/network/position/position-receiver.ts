import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import ServerPositionComponent from "../../../../client/entity/components/server-position-component";

export default class PositionReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {

        receiveComponent.commandHandlers.set(Commands.POSITION_UPDATE_COMMAND, (buffer) => {
            const x = buffer.readFloat32()
            const y = buffer.readFloat32()
            const angle = buffer.readFloat32()
            const vx = buffer.readFloat32()
            const vy = buffer.readFloat32()
            const angularVelocity = buffer.readFloat32()

            const serverPosition = this.entity.getComponent(ServerPositionComponent)

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