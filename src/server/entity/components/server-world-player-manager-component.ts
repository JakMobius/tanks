import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";

export default class ServerWorldPlayerManagerComponent extends EventHandlerComponent {
    players: Entity[] = []

    constructor() {
        super()
        this.eventHandler.on("player-connect", (player) => this.onPlayerConnect(player))
        this.eventHandler.on("player-disconnect", (player) => this.onPlayerDisconnect(player))
    }

    private onPlayerConnect(player: Entity) {
        this.players.push(player)
    }

    private onPlayerDisconnect(player: Entity) {
        let index = this.players.indexOf(player)
        if(index === -1) return
        this.players.splice(index, 1)
    }
}