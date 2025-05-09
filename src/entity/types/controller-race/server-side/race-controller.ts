import ServerGameController from "src/server/room/game-modes/server-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import { PlayerRaceStateComponent } from "./player-race-state-component";
import PlayerWorldComponent from "../../player/server-side/player-world-component";
import { RacePlayingStateController } from "./race-playing-state-controller";

export default class RaceController extends ServerGameController {

    constructor() {
        super()

        this.worldEventHandler.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
            player.addComponent(new PlayerRaceStateComponent())
            player.getComponent(PlayerWorldComponent).redirectPlayerEventToWorld("checkpoint-pass", "player-checkpoint-pass")
        })
    }

    setWorld(world: Entity): void {
        this.activateGameState(null)
        super.setWorld(world)
        if (world) {
            this.activateGameState(new RacePlayingStateController(this))
        }
    }
}