import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import MapDrawerComponent from "./map-drawer-component";
import MapReceiver from "src/entity/components/network/map/map-receiver";
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import ExplodePoolParticleComponent from "src/client/entity/components/explode-pool-particle-component";

ClientEntityPrefabs.associate(EntityType.TILEMAP, (entity) => {
    EntityPrefabs.Types.get(EntityType.TILEMAP)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)
    entity.addComponent(new MapDrawerComponent())
    entity.addComponent(new MapReceiver())
    entity.addComponent(new ExplodeEffectPool({
        damageBlocks: false
    }))
    entity.addComponent(new ExplodePoolParticleComponent())
})