import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import MortarBallHeightComponent from "src/entity/components/network/mortar-ball-height/mortar-ball-height-component";

export default class MortarBallHeightReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.MORTAR_BALL_HEIGHT_SET, (buffer) => {
            let height = buffer.readFloat32()
            let vSpeed = buffer.readFloat32()

            let component = this.entity.getComponent(MortarBallHeightComponent)
            component.height = height
            component.vSpeed = vSpeed
        })
    }
}