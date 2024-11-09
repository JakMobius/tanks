import EventEmitter from "../utils/event-emitter";
import Entity from "src/utils/ecs/entity";

export default class Team extends EventEmitter {
    public players: Entity[] = []
    public id: number

    addPlayer(player: Entity) {
        this.players.push(player)
        this.emit("player-added", player)
    }

    removePlayer(player: Entity) {
        let index = this.players.indexOf(player)
        if(index == -1) return;
        this.players.splice(index, 1)
        this.emit("player-removed", player)
    }
}