import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import {FlagStateComponent} from "src/entity/types/flag/server-side/flag-state-component";
import FlagContactComponent from "src/entity/types/flag/server-side/flag-contact-component";
import TimerComponent from "../timer/timer-component";
import BasePrefab from "./prefab"

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)
        entity.addComponent(new FlagStateComponent())
        entity.addComponent(new TimerComponent())
        entity.addComponent(new FlagContactComponent())
    }
})

export default ServerPrefab;