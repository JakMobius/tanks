import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import SoundReceiver from "src/entity/types/effect-sound/client-side/sound-receiver";
import ClientSoundEffectComponent from "src/entity/types/effect-sound/client-side/client-sound-effect-component";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new SoundReceiver())
        entity.addComponent(new ClientSoundEffectComponent())
    }
})

export default ClientPrefab;