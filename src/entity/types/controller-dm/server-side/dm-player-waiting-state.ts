import DMController from "src/entity/types/controller-dm/server-side/dm-controller";
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import {DMPlayingStateController} from "src/entity/types/controller-dm/server-side/dm-playing-state-controller";
import { RandomRespawnScript } from "src/server/room/game-modes/scripts/respawn-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";

export class DMPlayerWaitingStateController extends ServerGameStateController<DMController, DMGameState> {

    constructor(controller: DMController) {
        super(controller)

        const timeComponent = controller.entity.getComponent(GameTimeComponent)

        this.addScript(new NoDamageScript(this.controller))

        this.addScript(new GameStartTimerScript(this.controller, timeComponent.matchStartDelay, () => {
            this.controller.activateGameState(new DMPlayingStateController(this.controller))
        }))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount) => {
            this.getScript(GameStartTimerScript).setTimerStarted(playerCount >= timeComponent.minPlayers)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new RandomRespawnScript(this.controller))
    }

    getState(): DMGameState {
        const timeComponent = this.controller.entity.getComponent(GameTimeComponent)
        return {
            state: DMGameStateType.waitingForPlayers,
            minPlayers: timeComponent.minPlayers,
            currentPlayers: this.controller.players.size,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}