import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import DelayedActionScript from "src/server/room/game-modes/scripts/delayed-action-script";
import CTFGameStateController from "src/entity/types/controller-ctf/server-side/ctf-game-state-controller";
import ServerCTFControllerComponent from "src/entity/types/controller-ctf/server-side/server-ctf-controller-component";
import {CTFGameState, CTFGameStateType, CTFTeamStatistics} from "src/entity/types/controller-ctf/ctf-game-state";
import {CTFPlayerWaitingStateController} from "src/entity/types/controller-ctf/server-side/ctf-player-waiting-state";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";

export class CTFMatchOverStateController extends CTFGameStateController {
    private statistics: CTFTeamStatistics[];

    constructor(controller: ServerCTFControllerComponent, statistics: CTFTeamStatistics[]) {
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