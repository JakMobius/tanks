import EngineSoundComponent from "src/client/entity/components/engine-sound-component";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import { Drawer } from "src/entity/types/tank-bigboi/client-side/drawer";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import { SoundType } from "src/sound/sounds";
import EntityPilotReceiver from "src/entity/components/entity-player-list/entity-pilot-receiver";
import BasePrefab from "./prefab"
import EntityStateReceiver from "src/entity/components/network/entity/entity-state-receiver";
import ServerPositionComponent from "src/client/entity/components/server-position-component";
import TransformReceiver from "src/entity/components/transform/transform-receiver";
import HealthReceiver from "src/entity/components/health/health-receiver";
import CollisionIgnoreListReceiver from "src/entity/components/collisions/collision-ignore-list-receiver";

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        description: "Это невероятное чудо техники создано, чтобы " +
            "уничтожать всё на своём пути. Снаряд этого танка, " +
            "имея огромную массу, способен резко изменить " +
            "траекторию движения соперника или вовсе закрутить и обездвижить его."
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())

        entity.addComponent(new EngineSoundComponent({
            sound: SoundType.ENGINE_1,
            engine: entity.getComponent(TrackedTankController).engine
        }))

        entity.addComponent(new DamageSmokeEffectComponent())
        entity.addComponent(new EntityPilotReceiver())
        entity.addComponent(new Drawer())
    }
})

export default ClientPrefab;