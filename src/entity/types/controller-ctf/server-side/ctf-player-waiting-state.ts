import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import CTFGameStateController from "src/entity/types/controller-ctf/server-side/ctf-game-state-controller";
import {CTFGameState, CTFGameStateType} from "src/entity/types/controller-ctf/ctf-game-state";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import CTFPlayingStateController from "src/entity/types/controller-ctf/server-side/ctf-playing-state-controller";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import { TeamedRespawnScript } from "src/server/room/game-modes/scripts/player-spawn-position-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";

export class CTFPlayerWaitingStateController extends CTFGameStateController {

    constructor(controller: ServerCTFControllerComponent) {
        super(controller)

        const timeComponent = this.controller.entity.getComponent(GameTimeComponent)

        this.addScript(new NoDamageScript(this.controller))

        this.addScript(new GameStartTimerScript(this.controller, timeComponent.matchStartDelay, () => {
            this.controller.activateGameState(new CTFPlayingStateController(this.controller))
        }))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount) => {
            this.getScript(GameStartTimerScript).setTimerStarted(playerCount >= timeComponent.minPlayers)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new TeamedRespawnScript(this.controller, { usePlayerTeam: false }))
    }

    getState(): CTFGameState {
        const timeComponent = this.controller.entity.getComponent(GameTimeComponent)
        return {
            state: CTFGameStateType.waitingForPlayers,
            minPlayers: timeComponent.minPlayers,
            currentPlayers: this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.length,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}