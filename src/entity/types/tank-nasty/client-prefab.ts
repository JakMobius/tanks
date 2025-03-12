import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import { Drawer } from "src/entity/types/tank-nasty/client-side/drawer";
import AirbagTankController from "src/entity/components/tank-controllers/airbag-tank-controller";
import { SoundType } from "src/sound/sounds";
import EntityPilotReceiver from 'src/entity/components/entity-player-list/entity-pilot-receiver';
import BasePrefab from "./prefab"
import ServerPositionComponent from 'src/client/entity/components/server-position-component';
import CollisionIgnoreListReceiver from 'src/entity/components/collisions/collision-ignore-list-receiver';
import HealthReceiver from 'src/entity/components/health/health-receiver';
import EntityStateReceiver from 'src/entity/components/network/entity/entity-state-receiver';
import TransformReceiver from 'src/entity/components/transform/transform-receiver';

const ClientPrefab = new ClientEntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        description: "Любите запах напалма по утрам? Тогда эта машина - " +
            "идеальный выбор для вас! Сложный в управлении, но чудовищно " +
            "разрушительный танк с огнемётом на воздушной подушке."
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())

        entity.addComponent(new EngineSoundComponent({
            sound: SoundType.ENGINE_4,
            volume: 0.6,
            engine: entity.getComponent(AirbagTankController).engine
        }))

        entity.addComponent(new DamageSmokeEffectComponent())
        entity.addComponent(new EntityPilotReceiver())
        entity.addComponent(new Drawer())
    }
})

export default ClientPrefab;