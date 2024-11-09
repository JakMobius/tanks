import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import PelletsEffectComponent from "src/entity/types/effect-pellets/pellets-effect-component";

export default class PelletsEffectReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.PELLETS_TRIGGER_COMMAND, (buffer) => {
            this.entity.getComponent(PelletsEffectComponent).trigger()
        })
    }
}