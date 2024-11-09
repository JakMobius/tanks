import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import {SoundAssets} from 'src/client/sound/sounds';
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import EntityPilotReceiver from "src/entity/components/network/entity-player-list/entity-pilot-receiver";
import {Drawer} from "src/entity/types/tank-monster/client-side/drawer";
import WheelSmokeComponent from "src/client/entity/components/wheel-smoke-component";
import WheeledTankController from "src/entity/components/tank-controllers/wheeled-tank-controller";
import {SoundType} from "src/sound/sounds";

ClientEntityPrefabs.associate(EntityType.TANK_MONSTER, (entity) => {
    // TODO: bad
    EntityPrefabs.Types.get(EntityType.TANK_MONSTER)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)

    entity.addComponent(new EngineSoundComponent({
        sound: SoundAssets[SoundType.ENGINE_3],
        engine: entity.getComponent(WheeledTankController).engine
    }))

    entity.addComponent(new DamageSmokeEffectComponent())
    entity.addComponent(new WheelSmokeComponent())
    entity.addComponent(new EntityPilotReceiver())
    entity.addComponent(new Drawer())
})