import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import FlagStateComponent from "src/entity/types/flag/flag-state-component";

export default class FlagStateReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.FLAG_POSITION_COMMAND, (buffer) => {
            let flagState = this.entity.getComponent(FlagStateComponent)
            flagState.setTeam(buffer.readInt8())
            let hasCarrier = buffer.readUint8() === 1
            if(hasCarrier) {
                flagState.setCarrier(component.readEntity(buffer))
            } else {
                let x = buffer.readFloat32()
                let y = buffer.readFloat32()
                flagState.setPosition({
                    x: x,
                    y: y
                })
            }
        })
    }
}