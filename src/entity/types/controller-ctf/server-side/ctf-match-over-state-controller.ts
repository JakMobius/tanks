import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import DelayedActionScript from "src/server/room/game-modes/scripts/delayed-action-script";
import CTFController from "src/entity/types/controller-ctf/server-side/ctf-controller";
import {CTFEventData, CTFGameState, CTFGameStateType, CTFTeamStatistics} from "src/entity/types/controller-ctf/ctf-game-state";
import {CTFPlayerWaitingStateController} from "src/entity/types/controller-ctf/server-side/ctf-player-waiting-state";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";
import ServerGameStateController from "src/server/room/game-modes/server-game-state-controller";

export class CTFMatchOverStateController extends ServerGameStateController<CTFController, CTFGameState, CTFEventData> {
    private statistics: CTFTeamStatistics[];

    constructor(controller: CTFController, statistics: CTFTeamStatistics[]) {
        super(controller)

        this.statistics = statistics
        const timeComponent = this.controller.entity.getComponent(GameTimeComponent)

        this.addScript(new NoDamageScript(this.controller))
        this.addScript(new DelayedActionScript(this.controller, timeComponent.matchEndDelay, () => {
            this.controller.activateGameState(new CTFPlayerWaitingStateController(this.controller))
        }))
    }

    getState(): CTFGameState {
        return {
            state: CTFGameStateType.matchOver,
            teamStatistics: this.statistics
        }
    }
}