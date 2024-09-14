import SettingsController from "src/client/ui/overlay/pause-overlay/controllers/settings-controller";
import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import LoadMapController from "src/client/map-editor/ui/pause/load-map-controller";
import NewMapController from "src/client/map-editor/ui/pause/new-map-controller";

export class MainView extends PauseMenuView {
    constructor(controller: MapEditorPauseMainController) {
        super(controller);

        this.addButton("Новая карта").blue().target(NewMapController)
        this.addButton("Сохранить карту").blue()
        this.addButton("Загрузить карту").blue().target(LoadMapController)
        this.addButton("Настройки").blue().target(SettingsController)
        this.addButton("Вернуться в редактор").blue().click(() => controller.navigationView.emit("close"))
        this.addButton("Выйти из редактора").red().click(() => location.hash = "")
    }
}

export default class MapEditorPauseMainController extends PauseViewController {
    constructor() {
        super();
        this.title = "Меню"
        this.view = new MainView(this)
    }
}