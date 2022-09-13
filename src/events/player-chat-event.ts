import Player from "../server/player";
import CancellableEvent from "./cancellable-event";

export default class PlayerChatEvent extends CancellableEvent {
    player: Player
    message: string

    constructor(player: Player, message: string) {
        super()
        this.player = player
        this.message = message
    }
}