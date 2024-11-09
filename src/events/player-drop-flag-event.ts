import CancellableEvent from "./cancellable-event";
import Entity from "src/utils/ecs/entity";

export default class PlayerDropFlagEvent extends CancellableEvent {
    player: Entity

    constructor(player: Entity) {
        super();
        this.player = player
    }
}