
import {Constructor} from "src/utils/constructor"
import Controller from "src/client/ui/controller/controller";
import PauseNavigationTransition from "src/client/ui/overlay/pause-overlay/navigation/pause-navigation-transition";
import Cloud from "src/client/game/ui/cloud/cloud";

export default class PauseNavigationCloud extends Cloud {

    controller: Controller

    constructor(controller: Controller) {
        super();
        this.controller = controller
    }

    target(ControllerClass: Constructor<Controller>) {
        this.element.on("click", () => {
            const target = new ControllerClass()
            target.controlsResponder = this.controller.controlsResponder
            this.controller.navigationView.pushController(target, new PauseNavigationTransition(this))
        })
    }

    click(callback: () => void) {
        this.element.on("click", callback)
    }
}