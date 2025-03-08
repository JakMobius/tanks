import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import DelayedActionScript from "src/server/room/game-modes/scripts/delayed-action-script";
import CTFGameStateController from "src/entity/types/controller-ctf/server-side/ctf-game-state-controller";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import {CTFGameData, CTFGameStateType, CTFTeamStatistics} from "src/entity/types/controller-ctf/ctf-game-state";
import {CTFPlayerWaitingStateController} from "src/entity/types/controller-ctf/server-side/ctf-player-waiting-state";

export class CTFMatchOverStateController extends CTFGameStateController {
    private statistics: CTFTeamStatistics[];

    constructor(controller: ServerCTFControllerComponent, statistics: CTFTeamStatistics[]) {
        super(controller)

        this.statistics = statistics

        this.addScript(new NoDamageScript(this.controller))
        this.addScript(new DelayedActionScript(this.controller, controller.matchEndDelay, () => {
            this.controller.activateGameState(new CTFPlayerWaitingStateController(this.controller))
        }))
    }

    getState(): CTFGameData {
        return {
            state: CTFGameStateType.matchOver,
            teamStatistics: this.statistics
        }
    }
}