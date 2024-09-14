import {EntityType} from "src/entity/entity-type";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import ClientFlameEffectComponent from "src/entity/types/effect-flame/client-side/client-flame-effect-component";
import FlameEffectReceiver from "src/entity/types/effect-flame/client-side/flame-effect-receiver";
import ChildTickComponent from "src/entity/components/child-tick-component";

ClientEntityPrefabs.types.set(EntityType.EFFECT_FLAME, (entity) => {
    EntityPrefabs.Types.get(EntityType.EFFECT_FLAME)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new ChildTickComponent())
    entity.addComponent(new FlameEffectReceiver())
    entity.addComponent(new ClientFlameEffectComponent())
})