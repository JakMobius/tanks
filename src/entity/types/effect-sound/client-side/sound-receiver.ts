import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import SoundEffectComponent from "src/entity/types/effect-sound/sound-effect-component";

export default class SoundReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.SOUND_COMMAND, (buffer) => {
            let x = buffer.readFloat64()
            let y = buffer.readFloat64()
            let index = buffer.readUint32()

            this.entity.getComponent(SoundEffectComponent).playSound(x, y, index)
        })
    }
}