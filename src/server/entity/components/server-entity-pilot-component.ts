
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import EntityPilotTransmitter from "src/entity/components/entity-player-list/entity-pilot-transmitter";

export default class ServerEntityPilotComponent extends EventHandlerComponent {
    pilot: Entity | null

    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (transmitterSet) => {
            transmitterSet.initializeTransmitter(EntityPilotTransmitter)
        })
    }

    setPilot(player: Entity) {
        this.pilot = player
        this.entity.emit("pilot-set", player)
    }
}