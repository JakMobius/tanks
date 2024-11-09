import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import AxisSelector from "src/client/ui/overlay/pause-overlay/elements/axis-selector/axis-selector";
import ControllerSelector from "src/client/ui/overlay/pause-overlay/elements/controller-selector/controller-selector";
import InputDevice from "src/client/controls/input/input-device";
import GameSettings from "src/client/settings/game-settings";
import RootControlsResponder from "src/client/controls/root-controls-responder";
import ControlsPrinter from "src/client/controls/controls-printer";

export class ControlsView extends PauseMenuView {

    private controllerSelectorView = new ControllerSelector()
    private selectors = new Map<string, AxisSelector>()

    constructor(controller: PauseControlsViewController) {
        super(controller);

        this.addSubtitle("Обнаруженные контроллеры")

        this.element.append(this.controllerSelectorView.element)

        this.addButton("Настройки контроллера").blue()

        this.addSubtitle("Управление танком")
        this.addAxisSelector("Газ", "tank-throttle-forward")
        this.addAxisSelector("Тормоз / назад", "tank-throttle-backward")
        this.addAxisSelector("Влево", "tank-steer-left")
        this.addAxisSelector("Вправо", "tank-steer-right")
        this.addAxisSelector("Выстрел", "tank-primary-weapon")
        this.addAxisSelector("Поставить мину", "tank-miner")

        this.addSubtitle("Игровой процесс")
        this.addAxisSelector("Чат", "game-chat")
        this.addAxisSelector("Респавн", "tank-respawn")
        this.addAxisSelector("Сброс флага", "tank-flag-drop")
        this.addAxisSelector("Список игроков", "game-player-list")
        this.addAxisSelector("Пауза", "game-pause")

        this.addSubtitle("Сброс")
        this.addButton("Настройки по умолчанию").red()

        this.controllerSelectorView.on("select", () => {
            this.updateController()
        })

        this.updateController()
    }

    private addAxisSelector(title: string, axisName: string) {
        let selector = new AxisSelector(title)
        this.selectors.set(axisName, selector)
        this.element.append(selector.element)
    }

    private updateController() {
        let index = this.controllerSelectorView.selectedIndex
        let device = RootControlsResponder.getInstance().devices[index]
        this.showControlsForController(device)
    }

    private showControlsForController(device: InputDevice) {
        let settings = GameSettings.getInstance().controls.getConfigForDevice(device)

        for(let [axisName, selector] of this.selectors) {
            let axes = settings.get(axisName)
            if(axes) {
                selector.setAxes(axes.map(axle => ControlsPrinter.getPrintedNameOfAxle(axle, device)))
            } else {
                selector.setAxes([])
            }
        }
    }

    public onFocus() {
        this.controllerSelectorView.startListening()
    }

    public onBlur() {
        this.controllerSelectorView.stopListening()
    }
}

export default class PauseControlsViewController extends PauseViewController {
    constructor() {
        super();
        this.title = "Управление"
        this.view = new ControlsView(this)
    }

    onFocus() {
        (this.view as ControlsView).onFocus()
    }

    onBlur() {
        (this.view as ControlsView).onBlur()
    }
}