import Player from "../server/player";
import * as Box2D from "../library/box2d"
import CancellableEvent from "./cancellable-event";

export default class PlayerRespawnEvent extends CancellableEvent {
    player: Player
    respawnPosition: Box2D.XY = {
        x: 0, y: 0
    }
    respawnAngle = 0

    constructor(player: Player) {
        super();
        this.player = player
    }
}