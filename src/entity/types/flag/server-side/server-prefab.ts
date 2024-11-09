import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import {FlagDataComponent} from "src/entity/types/controller-ctf/server-side/scripts/flag-data-component";
import FlagContactComponent from "src/entity/types/controller-ctf/server-side/scripts/flag-contact-component";
import FlagPositionTransmitComponent
    from "src/entity/types/controller-ctf/server-side/scripts/flag-position-transmit-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";

ServerEntityPrefabs.types.set(EntityType.FLAG, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.FLAG)(entity)

    entity.addComponent(new FlagDataComponent())
    entity.addComponent(new TimerComponent())
    entity.addComponent(new FlagContactComponent())
    entity.addComponent(new FlagPositionTransmitComponent())
})