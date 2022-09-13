import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Player from "src/server/player";
import EventEmitter from "src/utils/event-emitter";
import PlayerConnectEvent from "src/events/player-connect-event";
import PlayerDisconnectEvent from "src/events/player-disconnect-event";

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