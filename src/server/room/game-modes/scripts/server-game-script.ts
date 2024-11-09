import ServerGameController from "src/server/room/game-modes/server-game-controller";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class ServerGameScript<ControllerClass extends ServerGameController = ServerGameController> {
    controller: ControllerClass
    worldEventHandler = new BasicEventHandlerSet()
    active: boolean = false

    protected constructor(controller: ControllerClass) {
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
}