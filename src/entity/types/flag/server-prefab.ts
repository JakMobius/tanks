import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import {FlagStateComponent} from "src/entity/types/flag/server-side/flag-state-component";
import FlagContactComponent from "src/entity/types/flag/server-side/flag-contact-component";
import TimerComponent from "../timer/timer-component";

ServerEntityPrefabs.types.set(EntityType.FLAG, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.FLAG)(entity)

    entity.addComponent(new FlagStateComponent())
    entity.addComponent(new TimerComponent())
    entity.addComponent(new FlagContactComponent())
})