import ReceiverComponent from "../receiving/receiver-component";
import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import TimerComponent from "./timer-component";

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