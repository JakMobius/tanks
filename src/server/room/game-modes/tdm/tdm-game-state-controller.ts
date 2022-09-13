import ServerTDMControllerComponent from "./server-tdm-controller-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import ServerGameStateController from "../server-game-state-controller";
import {TDMGameState} from "src/game-modes/tdm-game-state";

export default abstract class TDMGameStateController implements ServerGameStateController {

    active: boolean = true
    controller: ServerTDMControllerComponent
    worldEventHandler = new BasicEventHandlerSet()

    protected constructor(controller: ServerTDMControllerComponent) {
        this.controller = controller
    }

    activate() {
        this.worldEventHandler.setTarget(this.controller.world)
        this.active = true
    }

    deactivate() {
        this.worldEventHandler.setTarget(null)
        this.active = false
    }

    abstract getState(): TDMGameState
}

