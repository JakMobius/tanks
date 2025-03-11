import TDMGameStateController from "src/entity/types/controller-tdm/server-side/tdm-game-state-controller";
import ServerTDMControllerComponent from "src/entity/types/controller-tdm/server-side/server-tdm-controller-component";
import {TDMPlayingStateController} from "src/entity/types/controller-tdm/server-side/tdm-playing-state-controller";
import {TDMGameState, TDMGameStateType} from "src/entity/types/controller-tdm/tdm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import { TeamedRespawnScript } from "src/server/room/game-modes/scripts/player-spawn-position-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";

export class TDMPlayerWaitingStateController extends TDMGameStateController {

    constructor(controller: ServerTDMControllerComponent) {
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
            currentPlayers: this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.length,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}