import { EntityPrefab } from "src/entity/entity-prefabs";
import VisibilityInheritanceComponent
    from "src/entity/components/network/transmitting/visibility-inheritance-component";
import Transmitter from "src/entity/components/network/transmitting/transmitter";
import { Commands } from "src/entity/components/network/commands";
import { createTransmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component";
import BasePrefab from "./prefab"
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import EntityStateTransmitComponent from "src/server/entity/components/entity-state-transmit-component";

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
        entity.addComponent(new EntityDataTransmitComponent())
        entity.addComponent(new EntityStateTransmitComponent())
        BasePrefab.prefab(entity)

        entity.addComponent(createTransmitterComponentFor(FlameTransmitter))
        entity.addComponent(new VisibilityInheritanceComponent())
    }
})

export default ServerPrefab;