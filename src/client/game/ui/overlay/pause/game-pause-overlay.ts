/* @load-resource: ./game-pause-overlay.scss */

import Overlay, {OverlayConfig} from "../../../../ui/overlay/overlay";
import MainController from "./controllers/main-controller";
import BasicNavigationView from "../../../../ui/navigation/basic-navigation-view";
import GamePauseNavigationBlock from "./game-pause-navigation-block";

export class GamePauseOverlay extends Overlay {

    navigationView = new BasicNavigationView()

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