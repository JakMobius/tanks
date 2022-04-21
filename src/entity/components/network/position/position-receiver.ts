
import EntityDataReceiveComponent from "../entity-data-receive-component";
import PhysicalComponent from "../../physics-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import ServerPosition from "../../../../client/entity/server-position";

export default class PositionReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {

        receiveComponent.commandHandlers.set(Commands.POSITION_UPDATE_COMMAND, (buffer) => {
            // let teleport = buffer.readUint8()
            let x = buffer.readFloat32()
            let y = buffer.readFloat32()
            let rotation = buffer.readFloat32()
            let vx = buffer.readFloat32()
            let vy = buffer.readFloat32()
            let angularVelocity = buffer.readFloat32()

            const body = this.entity.getComponent(PhysicalComponent).getBody()

            let velocity = body.GetLinearVelocity()

            velocity.Set(vx, vy)

            body.SetLinearVelocity(velocity)
            body.SetAngularVelocity(angularVelocity)

            // When teleporting, entity should instantly move
            // from one point to another. Otherwise, this
            // meant to be continuous movement. Considering
            // ping jitter and other imperfections of WWW,
            // these positions should be interpolated to give
            // a smooth move impression to player.

            // TODO: figure out how to do it right
            // if (teleport) {
            //     body.SetPositionXY(x, y)
            // }

            const serverPosition = this.entity.getComponent(ServerPosition)

            serverPosition.serverPosition.Set(x, y)
            serverPosition.serverVelocity.Set(vx, vy)
            serverPosition.serverPositionUpdateDate = Date.now()

            body.SetAngle(rotation)
        })
    }
}