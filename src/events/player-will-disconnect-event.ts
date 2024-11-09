import Entity from "src/utils/ecs/entity";

export default class PlayerWillDisconnectEvent {
    player: Entity

    constructor(player: Entity) {
        this.player = player
    }
}