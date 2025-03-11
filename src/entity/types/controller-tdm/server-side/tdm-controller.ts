import { TDMPlayerWaitingStateController } from "src/entity/types/controller-tdm/server-side/tdm-player-waiting-state";
import ServerTeamedGameController from "src/server/room/game-modes/server-teamed-game-controller";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import Entity from "src/utils/ecs/entity";
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import { TDMGameState } from "../tdm-game-state";

export abstract class TDMGameStateController extends ServerGameStateController<TDMController, TDMGameState> {}

export default class TDMController extends ServerTeamedGameController {
    constructor() {
        super()
        this.worldEventHandler.on("player-connect", (player) => {
            player.addComponent(new PlayerPreferredTankComponent())
        })
    }

    setWorld(world: Entity): void {
        this.activateGameState(null)
        super.setWorld(world)
        if (world) this.activateGameState(new TDMPlayerWaitingStateController(this))
    }
}