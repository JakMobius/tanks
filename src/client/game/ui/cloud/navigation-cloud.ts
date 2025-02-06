import Cloud from "./cloud"
import Controller from "src/client/ui/controller/controller";
import GamePauseNavigationTransition from "../overlay/pause/game-pause-navigation-transition";
import { Constructor } from "src/utils/constructor";

export default class NavigationCloud extends Cloud {

    controller: Controller

    constructor(controller: Controller) {
        super();
        this.controller = controller
    }

    target(ControllerClass: Constructor<Controller>) {
        this.element.on("click", () => {
            const target = new ControllerClass()
            this.controller.navigationView.pushController(target, new GamePauseNavigationTransition(this))
        })
    }

    click(callback: () => void) {
        this.element.on("click", callback)
    }
}