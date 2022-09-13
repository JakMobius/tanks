/* @load-resource: ./game-pause-overlay.scss */

import Overlay, {OverlayConfig} from "../../../../ui/overlay/overlay";
import MainController from "./controllers/main-controller";
import GamePauseNavigationBlock from "./game-pause-navigation-block";
import GamePauseNavigationView from "./game-pause-navigation-view";
import MenuOverlay from "../../../../ui/menu-overlay/menu-overlay";

export class GamePauseOverlay extends MenuOverlay {

    navigationView = new GamePauseNavigationView()

    constructor(options: OverlayConfig) {
        super(options);

        this.overlay.addClass("pause-overlay")

        this.navigationView.blockClass = GamePauseNavigationBlock
        this.navigationView.on("close", () => this.emit("close"))

        this.overlay.append(this.navigationView.element)
    }

    show(): void {
        if(this.shown) return
        super.show()
        this.navigationView.pushController(new MainController())

        this.overlay.addClass("shown")
    }

    hide(callback?: () => void): void {
        if(!this.shown) return
        super.hide()
        this.navigationView.clearControllers()

        this.overlay.removeClass("shown")
    }
}