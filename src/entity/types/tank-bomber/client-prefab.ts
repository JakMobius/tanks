import EngineSoundComponent from "src/client/entity/components/engine-sound-component";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import {Drawer} from "src/entity/types/tank-bomber/client-side/drawer";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import {SoundType} from "src/sound/sounds";
import EntityPilotReceiver from "src/entity/components/entity-player-list/entity-pilot-receiver";
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        description: "Идеальная машина для партизанской войны! Стены и углы" +
            " - ваши лучшие друзья. Снаряды отскакивают от стен и взрываются" +
            " при столкновении с танком."
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