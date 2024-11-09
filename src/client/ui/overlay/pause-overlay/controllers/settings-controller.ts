import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import GraphicsController from "src/client/ui/overlay/pause-overlay/controllers/graphics-controller";
import PauseControlsViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-controls-view-controller";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import SoundController from "src/client/ui/overlay/pause-overlay/controllers/sound-controller";
import GameSettings from "src/client/settings/game-settings";

export class SettingsView extends PauseMenuView {
    constructor(controller: SettingsController) {
        super(controller);

        this.addButton("Графика").blue().target(GraphicsController)
        this.addButton("Управление").blue().target(PauseControlsViewController)
        this.addButton("Звук").blue().target(SoundController)
    }
}

export default class SettingsController extends PauseViewController {

    private onBeforeUnloadHandler = () => GameSettings.getInstance().saveIfNeeded()

    constructor() {
        super();
        this.title = "Настройки"
        this.view = new SettingsView(this)
    }

    onFocus() {
        super.onFocus();
        window.addEventListener("beforeunload", this.onBeforeUnloadHandler)
    }

    onBlur() {
        super.onBlur();
        window.removeEventListener("beforeunload", this.onBeforeUnloadHandler)
        GameSettings.getInstance().saveIfNeeded()
    }
}