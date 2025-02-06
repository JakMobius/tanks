import * as Box2D from "@box2d/core"
import CancellableEvent from "./cancellable-event";
import Entity from "src/utils/ecs/entity";

export default class PlayerRespawnEvent extends CancellableEvent {
    player: Entity
    respawnPosition: Box2D.XY = {
        x: 0, y: 0
    }
    respawnAngle = 0

    constructor(player: Entity) {
        super();
        this.player = player
    }
}