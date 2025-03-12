import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ClientEntityPrefab from "src/client/entity/client-entity-prefab";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import { Drawer } from "src/entity/types/tank-tiny/client-side/drawer";
import WheelSmokeComponent from "src/client/entity/components/wheel-smoke-component";
import WheeledTankController from "src/entity/components/tank-controllers/wheeled-tank-controller";
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
        description: 
            "Формула дрифт среди военной техники! Обладает тонкой бронёй, " + 
            "самой лёгкой пушкой и приводом только на задние колёса." +
            "Стащите вражеский флаг в стиле Кена Блока, пока соперники разворачивают " +
            "свои неповоротливые танки!"
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        entity.addComponent(new EntityStateReceiver())
        entity.addComponent(new ServerPositionComponent())
        entity.addComponent(new TransformReceiver())
        entity.addComponent(new HealthReceiver())
        entity.addComponent(new CollisionIgnoreListReceiver())

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