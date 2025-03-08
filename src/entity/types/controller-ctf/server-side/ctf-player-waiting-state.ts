import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import CTFGameStateController from "src/entity/types/controller-ctf/server-side/ctf-game-state-controller";
import {CTFGameData, CTFGameStateType} from "src/entity/types/controller-ctf/ctf-game-state";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import CTFPlayingStateController from "src/entity/types/controller-ctf/server-side/ctf-playing-state-controller";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import { TeamedRespawnScript } from "src/server/room/game-modes/scripts/player-spawn-position-script";
import GameSpawnzonesComponent from "src/server/room/game-modes/game-spawnzones-component";

export class CTFPlayerWaitingStateController extends CTFGameStateController {

    constructor(controller: ServerCTFControllerComponent) {
        super(controller)

        this.addScript(new NoDamageScript(this.controller))

        this.addScript(new GameStartTimerScript(this.controller, this.controller.matchStartDelay, () => {
            this.controller.activateGameState(new CTFPlayingStateController(this.controller))
        }))

        this.addScript(new PlayerCountCallbackScript(this.controller, (playerCount) => {
            this.getScript(GameStartTimerScript).setTimerStarted(playerCount >= this.controller.minPlayers)
            this.controller.triggerStateBroadcast()
        }))

        this.addScript(new TeamedRespawnScript(this.controller, { usePlayerTeam: false }))
    }

    getState(): CTFGameData {
        return {
            state: CTFGameStateType.waitingForPlayers,
            minPlayers: this.controller.minPlayers,
            currentPlayers: this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.length,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}