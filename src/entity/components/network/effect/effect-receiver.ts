import EffectHostComponent from "../../../../effects/effect-host-component";
import ClientEffect from "../../../../client/effects/client-effect";
import {BinarySerializer} from "../../../../serialization/binary/serializable";
import EffectModel from "../../../../effects/effect-model";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import EntityDataReceiveComponent from "../entity-data-receive-component";

export default class EffectReceiver extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {

        receiveComponent.commandHandlers.set(Commands.EFFECT_CREATE_COMMAND, (buffer) => {
            const effect = BinarySerializer.deserialize(buffer, EffectModel)
            let wrapper = ClientEffect.fromModel(effect)
            this.entity.getComponent(EffectHostComponent).addEffect(wrapper)
        })

        receiveComponent.commandHandlers.set(Commands.EFFECT_REMOVE_COMMAND, (buffer) => {
            let id = buffer.readFloat64()
            let host = this.entity.getComponent(EffectHostComponent)
            let effect = host.getEffectById(id)
            if(effect) {
                host.removeEffect(effect)
            }
        })
    }
}