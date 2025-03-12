import { EntityPrefab } from "src/entity/entity-prefabs";
import {FlagStateComponent} from "src/entity/types/flag/server-side/flag-state-component";
import FlagContactComponent from "src/entity/types/flag/server-side/flag-contact-component";
import TimerComponent from "../timer/timer-component";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)
        entity.addComponent(new FlagStateComponent())
        entity.addComponent(new TimerComponent())
        entity.addComponent(new FlagContactComponent())
    }
})

export default ServerPrefab;