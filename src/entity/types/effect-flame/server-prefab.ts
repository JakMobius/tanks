import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import { EntityPrefab } from "src/entity/entity-prefabs";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import { Commands } from "src/entity/components/network/commands";
import { transmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import BasePrefab from "./prefab"

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

const ServerPrefab = new EntityPrefab({
    id: BasePrefab.id,
    metadata: BasePrefab.metadata,
    prefab: (entity) => {
        ServerEntityPrefabs.setupEntity(entity)
        BasePrefab.prefab(entity)

        entity.addComponent(transmitterComponentFor(FlameTransmitter))
        entity.addComponent(new VisibilityInheritanceComponent())
    }
})

export default ServerPrefab;