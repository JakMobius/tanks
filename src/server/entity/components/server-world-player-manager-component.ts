import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import Player from "../../player";
import EventEmitter from "../../../utils/event-emitter";
import PlayerConnectEvent from "../../../events/player-connect-event";
import PlayerDisconnectEvent from "../../../events/player-disconnect-event";

export default class ServerWorldPlayerManagerComponent implements Component {
    entity: Entity | null;
    private worldEventHandler = new BasicEventHandlerSet()
    players: Player[] = []

    constructor() {
        this.worldEventHandler.on("player-connect", (event) => this.onPlayerConnected(event), EventEmitter.PRIORITY_MONITOR)
        this.worldEventHandler.on("player-disconnect", (event) => this.onPlayerDisconnected(event), EventEmitter.PRIORITY_MONITOR)
    }

    private onPlayerConnected(event: PlayerConnectEvent) {
        if(event.declined) return
        this.players.push(event.player)
    }

    private onPlayerDisconnected(event: PlayerDisconnectEvent) {
        let index = this.players.indexOf(event.player)
        if(index === -1) return
        this.players.splice(index, 1)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.worldEventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
        this.worldEventHandler.setTarget(null)
    }
}