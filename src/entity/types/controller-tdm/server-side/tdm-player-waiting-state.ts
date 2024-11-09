import TDMGameStateController from "src/entity/types/controller-tdm/server-side/tdm-game-state-controller";
import ServerTDMControllerComponent from "src/entity/types/controller-tdm/server-side/server-tdm-controller-component";
import {TDMPlayingStateController} from "src/entity/types/controller-tdm/server-side/tdm-playing-state-controller";
import {TDMGameState, TDMGameStateType} from "src/entity/types/controller-tdm/tdm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import PlayerSpawnPositionScript, {
    RandomSpawnMode
} from "src/server/room/game-modes/scripts/player-spawn-position-script";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";

export class TDMPlayerWaitingStateController extends TDMGameStateController {

    constructor(controller: ServerTDMControllerComponent) {
        super(controller)

        this.addScript(new NoDamageScript(this.controller))

        this.addScript(new GameStartTimerScript(this.controller, this.controller.config.matchStartDelay, () => {
            this.controller.activateGameState(new TDMPlayingStateController(this.controller))
        }))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount) => {
            this.getScript(GameStartTimerScript).setTimerStarted(playerCount >= this.controller.config.minPlayers)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new PlayerSpawnPositionScript(this.controller, {
            usePlayerTeam: false,
            randomSpawnMode: RandomSpawnMode.randomTeamSpawn
        }))
    }

    getState(): TDMGameState {
        return {
            state: TDMGameStateType.waitingForPlayers,
            minPlayers: this.controller.config.minPlayers,
            currentPlayers: this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.length,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}