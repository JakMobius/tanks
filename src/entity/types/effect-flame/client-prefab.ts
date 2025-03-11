import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import ClientFlameEffectComponent from "src/entity/types/effect-flame/client-side/client-flame-effect-component";
import ChildTickComponent from "src/entity/components/child-tick-component";
import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import FlameEffectComponent from "./flame-effect-component";
import { Commands } from "src/entity/components/network/commands";
import BasePrefab from "./prefab"

class FlameEffectReceiver extends ReceiverComponent {
    hook(component: EntityDataReceiveComponent) {
        component.commandHandlers.set(Commands.SET_FIRING_COMMAND, (buffer) => {
            this.entity.getComponent(FlameEffectComponent).setFiring(!!buffer.readUint8())
        })
    }
}

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)

        entity.addComponent(new ChildTickComponent())
        entity.addComponent(new FlameEffectReceiver())
        entity.addComponent(new ClientFlameEffectComponent())
    }
})

export default ClientPrefab;