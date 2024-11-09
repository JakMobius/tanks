import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import GameStartTimerScript from "src/server/room/game-modes/scripts/game-start-timer-script";
import PlayerCountCallbackScript from "src/server/room/game-modes/scripts/player-count-callback-script";
import PlayerSpawnPositionScript, {
    RandomSpawnMode
} from "src/server/room/game-modes/scripts/player-spawn-position-script";
import CTFGameStateController from "src/entity/types/controller-ctf/server-side/ctf-game-state-controller";
import {CTFGameData, CTFGameStateType} from "src/entity/types/controller-ctf/ctf-game-data";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import CTFPlayingStateController from "src/entity/types/controller-ctf/server-side/ctf-playing-state-controller";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";

export class CTFPlayerWaitingStateController extends CTFGameStateController {

    constructor(controller: ServerCTFControllerComponent) {
        super(controller)

        this.addScript(new NoDamageScript(this.controller))

        this.addScript(new GameStartTimerScript(this.controller, this.controller.config.matchStartDelay, () => {
            this.controller.activateGameState(new CTFPlayingStateController(this.controller))
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

    getState(): CTFGameData {
        return {
            state: CTFGameStateType.waitingForPlayers,
            minPlayers: this.controller.config.minPlayers,
            currentPlayers: this.controller.world.getComponent(ServerWorldPlayerManagerComponent).players.length,
            timer: this.getScript(GameStartTimerScript).gameStartTimer
        }
    }
}