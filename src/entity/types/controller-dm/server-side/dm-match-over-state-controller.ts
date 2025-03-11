import DMController, { DMGameStateController } from "src/entity/types/controller-dm/server-side/dm-controller";
import {DMPlayerWaitingStateController} from "src/entity/types/controller-dm/server-side/dm-player-waiting-state";
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import NoDamageScript from "src/server/room/game-modes/scripts/no-damage-script";
import DelayedActionScript from "src/server/room/game-modes/scripts/delayed-action-script";
import { GameTimeComponent } from "src/server/room/game-modes/game-time-component";

export class DMMatchOverStateController extends DMGameStateController {

    constructor(controller: DMController) {
        super(controller)

        const timeComponent = controller.entity.getComponent(GameTimeComponent)

        this.addScript(new NoDamageScript(this.controller))
        this.addScript(new DelayedActionScript(this.controller, timeComponent.matchEndDelay, () => {
            this.controller.activateGameState(new DMPlayerWaitingStateController(this.controller))
        }))
    }

    getState(): DMGameState {
        return {
            state: DMGameStateType.matchOver
        }
    }
}