import {EntityType} from "src/entity/entity-type";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import ChildTickComponent from "src/entity/components/child-tick-component";
import ClientPelletsEffectComponent from "src/entity/types/effect-pellets/client-side/client-pellets-effect-component";
import PelletsEffectReceiver from "src/entity/types/effect-pellets/client-side/pellets-effect-receiver";

ClientEntityPrefabs.types.set(EntityType.EFFECT_SHOTGUN_PELLETS, (entity) => {
    EntityPrefabs.Types.get(EntityType.EFFECT_SHOTGUN_PELLETS)(entity)
    ClientEntityPrefabs.configureClientEntity(entity)

    entity.addComponent(new ChildTickComponent())
    entity.addComponent(new PelletsEffectReceiver())
    entity.addComponent(new ClientPelletsEffectComponent())
})