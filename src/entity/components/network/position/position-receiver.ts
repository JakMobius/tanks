import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiving/receiver-component";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import { Matrix3 } from "src/utils/matrix3";

export default class PositionReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {

        receiveComponent.commandHandlers.set(Commands.POSITION_UPDATE_COMMAND, (buffer) => {
            const serverPosition = this.entity.getComponent(ServerPositionComponent)

            let transform = new Matrix3()
            for(let i = 0; i < 9; i++) {
                transform.getArray()[i] = buffer.readFloat32()
            }

            serverPosition.serverTransform = transform

            let hasVelocity = buffer.readInt8() === 1
            
            if(hasVelocity) {
                serverPosition.serverVelocity.x = buffer.readFloat32()
                serverPosition.serverVelocity.y = buffer.readFloat32()
                serverPosition.serverAngularVelocity = buffer.readFloat32()

                serverPosition.serverTick = buffer.readUint16()
                serverPosition.serverTickTime = buffer.readFloat32()
            } else {
                serverPosition.serverVelocity.x = 0
                serverPosition.serverVelocity.y = 0
                serverPosition.serverAngularVelocity = 0

                serverPosition.serverTick = 0
                serverPosition.serverTickTime = 0
            }

            serverPosition.serverPositionReceived()
        })
    }
}