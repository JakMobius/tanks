import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import SettingsController from "src/client/ui/overlay/pause-overlay/controllers/settings-controller";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import PageLocation from "src/client/scenes/page-location";

export class MainView extends PauseMenuView {
    constructor(controller: GamePauseViewController) {
        super(controller);

        this.addButton("Настройки").blue().target(SettingsController)
        this.addButton("Продолжить игру").blue().click(() => controller.navigationView.emit("close"))
        this.addButton("Покинуть бой").red().click(() => PageLocation.navigateToScene("hub"))
    }
}

export default class GamePauseViewController extends PauseViewController {
    constructor() {
        super();
        this.title = "Пауза"
        this.view = new MainView(this)
    }
}