import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import FlameEffectComponent from "src/entity/types/effect-flame/flame-effect-component";

export default class FlameEffectReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.SET_FIRING_COMMAND, (buffer) => {
            this.entity.getComponent(FlameEffectComponent).setFiring(!!buffer.readUint8())
        })
    }
}