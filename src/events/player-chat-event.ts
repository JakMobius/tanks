import CancellableEvent from "./cancellable-event";
import Entity from "src/utils/ecs/entity";

export default class PlayerChatEvent extends CancellableEvent {
    player: Entity
    message: string

    constructor(player: Entity, message: string) {
        super()
        this.player = player
        this.message = message
    }
}