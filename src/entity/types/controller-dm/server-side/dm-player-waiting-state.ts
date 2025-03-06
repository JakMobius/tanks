import DMGameStateController from "src/entity/types/controller-dm/server-side/dm-game-state-controller";
import ServerDMControllerComponent from "src/entity/types/controller-dm/server-side/server-dm-controller-component";
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import {DMPlayingStateController} from "src/entity/types/controller-dm/server-side/dm-playing-state-controller";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import { RandomRespawnScript } from "src/server/room/game-modes/scripts/player-spawn-position-script";

export class DMPlayerWaitingStateController extends DMGameStateController {

    constructor(controller: ServerDMControllerComponent) {
        super(controller)

        this.addScript(new NoDamageScript(this.controller))

        this.addScript(new GameStartTimerScript(this.controller, this.controller.config.matchStartDelay, () => {
            this.controller.activateGameState(new DMPlayingStateController(this.controller))
        }))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount) => {
            this.getScript(GameStartTimerScript).setTimerStarted(playerCount >= this.controller.config.minPlayers)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new RandomRespawnScript(this.controller, controller.config.spawnZones))
    }

    getState(): DMGameState {
        return {
            state: DMGameStateType.waitingForPlayers,
            minPlayers: this.controller.config.minPlayers,
            currentPlayers: this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.length,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}