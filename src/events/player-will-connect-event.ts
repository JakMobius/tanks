import Entity from "src/utils/ecs/entity";

export default class PlayerWillConnectEvent {
    player: Entity

    constructor(player: Entity) {
        this.player = player
    }
}