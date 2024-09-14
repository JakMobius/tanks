import EngineSoundComponent from 'src/client/entity/components/engine-sound-component';
import {SoundAssets} from 'src/client/sound/sounds';
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import DamageSmokeEffectComponent from "src/client/entity/components/damage-smoke-effect-component";
import EntityPilotReceiver from "src/entity/components/network/entity-player-list/entity-pilot-receiver";
import {Drawer} from "src/entity/types/tank-nasty/client-side/drawer";
import AirbagTankController from "src/entity/components/tank-controllers/airbag-tank-controller";
import {SoundType} from "src/sound/sounds";

ClientEntityPrefabs.associate(EntityType.TANK_NASTY, (entity) => {
    // TODO: bad
    EntityPrefabs.Types.get(EntityType.TANK_NASTY)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)

    entity.addComponent(new EngineSoundComponent({
        sound: SoundAssets[SoundType.ENGINE_4],
        volume: 0.6,
        engine: entity.getComponent(AirbagTankController).engine
    }))

    entity.addComponent(new DamageSmokeEffectComponent())
    entity.addComponent(new EntityPilotReceiver())
    entity.addComponent(new Drawer())
})