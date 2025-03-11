import ServerGameController from "src/server/room/game-modes/server-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import { FreeroamPlayingStateController } from "./freeroam-playing-state-controller";

export default class ServerFreeroamControllerComponent extends ServerGameController {
    constructor() {
        super()

        this.worldEventHandler.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })
    }

    setWorld(world: Entity): void {
        this.activateGameState(null)
        super.setWorld(world)
        if (world) this.activateGameState(new FreeroamPlayingStateController(this))
    }
}