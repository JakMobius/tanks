import TDMGameStateController from "src/entity/types/controller-tdm/server-side/tdm-game-state-controller";
import {TDMGameState, TDMGameStateType, TDMTeamStatistics} from "src/entity/types/controller-tdm/tdm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import DelayedActionScript from "src/server/room/game-modes/scripts/delayed-action-script";
import ServerTDMControllerComponent from "src/entity/types/controller-tdm/server-side/server-tdm-controller-component";
import {TDMPlayerWaitingStateController} from "src/entity/types/controller-tdm/server-side/tdm-player-waiting-state";

export class TDMMatchOverStateController extends TDMGameStateController {
    private statistics: TDMTeamStatistics[];

    constructor(controller: ServerTDMControllerComponent, statistics: TDMTeamStatistics[]) {
        super(controller)

        this.statistics = statistics

        this.addScript(new NoDamageScript(this.controller))
        this.addScript(new DelayedActionScript(this.controller, controller.matchEndDelay, () => {
            this.controller.activateGameState(new TDMPlayerWaitingStateController(this.controller))
        }))
    }

    getState(): TDMGameState {
        return {
            state: TDMGameStateType.matchOver,
            teamStatistics: this.statistics
        }
    }
}