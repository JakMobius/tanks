
import Cloud from './cloud'
import {Constructor} from "../../../../serialization/binary/serializable";
import Controller from "../../../ui/controller/controller";
import GamePauseNavigationTransition from "../overlay/pause/game-pause-navigation-transition";

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