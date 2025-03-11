import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import {Drawer} from "src/entity/types/tank-monster/client-side/drawer";
import WheelSmokeComponent from "src/client/entity/components/wheel-smoke-component";
import WheeledTankController from "src/entity/components/tank-controllers/wheeled-tank-controller";
import {SoundType} from "src/sound/sounds";
import EntityPilotReceiver from 'src/entity/components/entity-player-list/entity-pilot-receiver';
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        description: "Рассекайте шоссе 66 на монстре! Скоростной пулемёт " +
            "поможет сбить прицел соперника, а мощный двигатель и " +
            "хорошая маневренность позволят оторваться от любой тяжелой " +
            "военной техники."
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)

        entity.addComponent(new EngineSoundComponent({
            sound: SoundType.ENGINE_3,
            engine: entity.getComponent(WheeledTankController).engine
        }))

        entity.addComponent(new DamageSmokeEffectComponent())
        entity.addComponent(new WheelSmokeComponent())
        entity.addComponent(new EntityPilotReceiver())
        entity.addComponent(new Drawer())
    }
})

export default ClientPrefab;