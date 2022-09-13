import ReceiverComponent from "../receiving/receiver-component";
import EntityDataReceiveComponent from "../receiving/entity-data-receive-component";
import {Commands} from "../commands";
import TimerComponent from "./timer-component";

export default class TimerReceiverComponent extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.TIMER_VALUE_COMMAND, (buffer) => {
            let time = buffer.readFloat64()
            let timer = this.entity.getComponent(TimerComponent)
            timer.setTime(time)
        })
    }
}