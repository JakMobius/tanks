import {PauseMenuView} from "../pause-menu-view";
import GraphicsController from "./graphics-controller";
import ControlsController from "./controls-controller";
import GamePauseViewController from "./pause-view-controller";
import SoundController from "./sound-controller";

export class SettingsView extends PauseMenuView {
    constructor(controller: SettingsController) {
        super(controller);

        this.addButton("Графика").blue().target(GraphicsController)
        this.addButton("Управление").blue().target(ControlsController)
        this.addButton("Звук").blue().target(SoundController)
    }
}

export default class SettingsController extends GamePauseViewController {
    constructor() {
        super();
        this.title = "Настройки"
        this.view = new SettingsView(this)
    }
}