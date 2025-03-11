import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import SoundReceiver from "src/entity/types/effect-sound/client-side/sound-receiver";
import ClientSoundEffectComponent from "src/entity/types/effect-sound/client-side/client-sound-effect-component";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureClientEntity(entity)
        entity.addComponent(new SoundReceiver())
        entity.addComponent(new ClientSoundEffectComponent())
    }
})

export default ClientPrefab;