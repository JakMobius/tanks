import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import ExplodeComponent from "src/entity/types/effect-world-explosion/explode-component";

export default class ExplodeReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.EXPLODE_COMMAND, (buffer) => {
            let x = buffer.readFloat64()
            let y = buffer.readFloat64()
            let power = buffer.readFloat64()

            this.entity.getComponent(ExplodeComponent).explode(x, y, power)
        })
    }
}