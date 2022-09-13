import Player from "../server/player";

export default class PlayerDisconnectEvent {
    player: Player

    constructor(player: Player) {
        this.player = player
    }
}