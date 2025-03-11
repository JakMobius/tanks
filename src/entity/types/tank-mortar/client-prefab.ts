import EngineSoundComponent from "src/client/entity/components/engine-sound-component";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import { Drawer } from "src/entity/types/tank-mortar/client-side/drawer";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import { SoundType } from "src/sound/sounds";
import EntityPilotReceiver from "src/entity/components/entity-player-list/entity-pilot-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        description: "Подкрадитесь к противнику за стеной и устройте ему незабываемый " +
            "град! Мортира позволит вам использовать стены против противника. Отлично " +
            "подходит для бомбежки строений."
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)

        entity.addComponent(new EngineSoundComponent({
            sound: SoundType.ENGINE_2,
            engine: entity.getComponent(TrackedTankController).engine
        }))

        entity.addComponent(new DamageSmokeEffectComponent())
        entity.addComponent(new EntityPilotReceiver())
        entity.addComponent(new Drawer())
    }
})

export default ClientPrefab;