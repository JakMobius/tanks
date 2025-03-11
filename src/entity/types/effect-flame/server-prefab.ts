import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import EntityPrefabs from "src/entity/entity-prefabs";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import { Commands } from "src/entity/components/network/commands";
import { transmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";

class FlameTransmitter extends Transmitter {
    constructor() {
        super()

        this.eventHandler.on("set-firing", (firing: boolean) => {
            this.packIfEnabled(Commands.SET_FIRING_COMMAND, (buffer) => {
                buffer.writeFloat64(firing ? 1 : 0)
            })
        })
    }
}

ServerEntityPrefabs.types.set(EntityType.EFFECT_FLAME, (entity) => {
    ServerEntityPrefabs.setupEntity(entity)
    EntityPrefabs.Types.get(EntityType.EFFECT_FLAME)(entity)

    entity.addComponent(transmitterComponentFor(FlameTransmitter))
    entity.addComponent(new VisibilityInheritanceComponent())
})