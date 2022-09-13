import {Component} from "../../../utils/ecs/component";
import Player from "../../player";
import Entity from "../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import EntityPilotListTransmitter
    from "../../../entity/components/network/entity-player-list/entity-pilot-list-transmitter";

export default class ServerEntityPilotListComponent implements Component {
    entity: Entity | null;
    players: Player[] = []
    eventHandler = new BasicEventHandlerSet()

    constructor() {
        this.eventHandler.on("transmitter-set-attached", (transmitterSet) => {
            transmitterSet.initializeTransmitter(EntityPilotListTransmitter)
        })
    }

    addPlayer(player: Player) {
        this.players.push(player)
        this.entity.emit("pilot-add", player)
    }

    removePlayer(player: Player) {
        this.players.splice(this.players.indexOf(player), 1)
        this.entity.emit("pilot-remove", player)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}