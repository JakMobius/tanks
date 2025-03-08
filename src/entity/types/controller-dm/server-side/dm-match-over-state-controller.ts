import DMGameStateController from "src/entity/types/controller-dm/server-side/dm-game-state-controller";
import ServerDMControllerComponent from "src/entity/types/controller-dm/server-side/server-dm-controller-component";
import {DMPlayerWaitingStateController} from "src/entity/types/controller-dm/server-side/dm-player-waiting-state";
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import DelayedActionScript from "src/server/room/game-modes/scripts/delayed-action-script";

export class DMMatchOverStateController extends DMGameStateController {

    constructor(controller: ServerDMControllerComponent) {
        super(controller)

        this.addScript(new NoDamageScript(this.controller))
        this.addScript(new DelayedActionScript(this.controller, controller.matchEndDelay, () => {
            this.controller.activateGameState(new DMPlayerWaitingStateController(this.controller))
        }))
    }

    getState(): DMGameState {
        return {
            state: DMGameStateType.matchOver
        }
    }
}