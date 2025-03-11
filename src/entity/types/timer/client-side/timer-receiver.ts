import { Commands } from "src/entity/components/network/commands"
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component"
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component"
import TimerComponent from "../timer-component"

export default class TimerReceiverComponent extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.TIMER_VALUE_COMMAND, (buffer) => {
            let currentTime = buffer.readFloat32()
            let originalTime = buffer.readFloat32()
            let timer = this.entity.getComponent(TimerComponent)
            timer.setCountdownState(currentTime, originalTime)
        })
    }
}