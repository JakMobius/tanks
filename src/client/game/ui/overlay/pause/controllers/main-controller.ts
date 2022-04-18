import {PauseMenuView} from "../pause-menu-view";
import SettingsController from "./settings-controller";
import GamePauseViewController from "./pause-view-controller";

export class MainView extends PauseMenuView {
    constructor(controller: MainController) {
        super(controller);

        this.addButton("Настройки").blue().target(SettingsController)
        this.addButton("Сменить танк").blue()
        this.addButton("Продолжить игру").blue().click(() => controller.navigationView.emit("close"))
        this.addButton("Покинуть бой").red()
    }
}

export default class MainController extends GamePauseViewController {
    constructor() {
        super();
        this.title = "Пауза"
        this.view = new MainView(this)
    }
}