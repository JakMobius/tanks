/* @load-resource: ./game-pause-overlay.scss */

import Overlay from "src/client/ui/overlay/overlay";
import PauseNavigationBlock from "src/client/ui/overlay/pause-overlay/navigation/pause-navigation-block";
import PauseNavigationView from "src/client/ui/overlay/pause-overlay/navigation/pause-navigation-view";
import View from "src/client/ui/view";
import Controller from "src/client/ui/controller/controller";
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";

export interface PauseOverlayConfig {
    rootController: PauseViewController,
    gameControls: ControlsResponder
}

export default class PauseOverlay extends Overlay {

    navigationView = new PauseNavigationView()
    rootController: PauseViewController
    pauseControlsResponder = new ControlsResponder()
    gameControlsResponder: ControlsResponder

    constructor(options: PauseOverlayConfig) {
        super();

        this.element.addClass("pause-overlay")

        this.gameControlsResponder = options.gameControls
        this.rootController = options.rootController
        this.rootController.controlsResponder = this.pauseControlsResponder

        this.navigationView.blockClass = PauseNavigationBlock
        this.navigationView.on("close", () => this.hide())

        this.element.append(this.navigationView.element)

        this.gameControlsResponder.on("game-pause", () => this.show())
    }

    show(): boolean {
        if (super.show()) {
            RootControlsResponder.getInstance().setMainResponderDelayed(this.pauseControlsResponder)
            this.navigationView.pushController(this.rootController)
            this.element.addClass("shown")
            return true
        }
        return false
    }

    hide(): boolean {
        if (super.hide()) {
            RootControlsResponder.getInstance().setMainResponderDelayed(this.gameControlsResponder)
            this.navigationView.clearControllers()
            this.element.removeClass("shown")
            return true
        }
        return false
    }
}