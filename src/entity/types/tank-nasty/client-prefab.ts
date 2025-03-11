import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import { Drawer } from "src/entity/types/tank-nasty/client-side/drawer";
import AirbagTankController from "src/entity/components/tank-controllers/airbag-tank-controller";
import { SoundType } from "src/sound/sounds";
import EntityPilotReceiver from 'src/entity/components/entity-player-list/entity-pilot-receiver';
import BasePrefab from "./prefab"

const ClientPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: {
        ...BasePrefab.metadata,
        description: "Любите запах напалма по утрам? Тогда эта машина - " +
            "идеальный выбор для вас! Сложный в управлении, но чудовищно " +
            "разрушительный танк с огнемётом на воздушной подушке."
    },
    prefab: (entity) => {
        BasePrefab.prefab(entity)
        ClientEntityPrefabs.configureGameWorldEntity(entity)

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