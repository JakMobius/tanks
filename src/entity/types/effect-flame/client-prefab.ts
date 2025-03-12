import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import ClientFlameEffectComponent from "src/entity/types/effect-flame/client-side/client-flame-effect-component";
import ChildTickComponent from "src/entity/components/child-tick-component";
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import FlameEffectComponent from "./flame-effect-component";
import { Commands } from "src/entity/components/network/commands";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";

class FlameEffectReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.SET_FIRING_COMMAND, (buffer) => {
            this.entity.getComponent(FlameEffectComponent).setFiring(!!buffer.readUint8())
        })
    }
}

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ChildTickComponent())
        entity.addComponent(new FlameEffectReceiver())
        entity.addComponent(new ClientFlameEffectComponent())
    }
})

export default ClientPrefab;