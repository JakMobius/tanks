
import ServerTDMController from "src/entity/types/controller-tdm/server-side/tdm-controller";
import {TDMPlayingStateController} from "src/entity/types/controller-tdm/server-side/tdm-playing-state-controller";
import {TDMGameState, TDMGameStateType} from "src/entity/types/controller-tdm/tdm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import { TeamedRespawnScript } from "src/server/room/game-modes/scripts/respawn-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";
import TDMController from "src/entity/types/controller-tdm/server-side/tdm-controller";

export class TDMPlayerWaitingStateController extends ServerGameStateController<TDMController, TDMGameState> {

    constructor(controller: ServerTDMController) {
        super(controller)

        const timeComponent = controller.entity.getComponent(GameTimeComponent)   

        this.addScript(new NoDamageScript(this.controller))

        this.addScript(new GameStartTimerScript(this.controller, timeComponent.matchStartDelay, () => {
            this.controller.activateGameState(new TDMPlayingStateController(this.controller))
        }))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount) => {
            this.getScript(GameStartTimerScript).setTimerStarted(playerCount >= timeComponent.minPlayers)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new TeamedRespawnScript(this.controller, { usePlayerTeam: false }))
    }

    getState(): TDMGameState {
        let timeComponent = this.controller.entity.getComponent(GameTimeComponent)
        
        return {
            state: TDMGameStateType.waitingForPlayers,
            minPlayers: timeComponent.minPlayers,
            currentPlayers: this.controller.players.size,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}