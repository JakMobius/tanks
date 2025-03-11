import {EntityType} from "src/entity/entity-type";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import ExplodeReceiver from "src/entity/types/effect-world-explosion/client-side/explode-receiver";
import ClientExplosionComponent from "src/entity/types/effect-world-explosion/client-side/client-explosion-component";

ClientEntityPrefabs.types.set(EntityType.EFFECT_WORLD_EXPLOSION, (entity) => {
    EntityPrefabs.Types.get(EntityType.EFFECT_WORLD_EXPLOSION)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)
    entity.addComponent(new ExplodeReceiver())
    entity.addComponent(new ClientExplosionComponent())
})