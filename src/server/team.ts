import Player from "./player";
import EventEmitter from "../utils/event-emitter";
import Color from "../utils/color";

export default class Team extends EventEmitter {
    public players: Player[] = []
    public id: number

    addPlayer(player: Player) {
        this.players.push(player)
        this.emit("player-added", player)
    }

    removePlayer(player: Player) {
        let index = this.players.indexOf(player)
        if(index == -1) return;
        this.players.splice(index, 1)
        this.emit("player-removed", player)
    }
}