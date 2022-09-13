import {PauseMenuView} from "../pause-menu-view";
import GamePauseViewController from "./pause-view-controller";
import AxisSelector from "src/client/game/ui/axis-selector/axis-selector";
import ControllerSelector from "src/client/game/ui/controller-selector/controller-selector";
import InputDevice from "src/client/controls/input/input-device";
import GameSettings from "src/client/settings/game-settings";
import ControlsManager from "src/client/controls/controls-manager";
import ControlsPrinter from "src/client/controls/controls-printer";

export class ControlsView extends PauseMenuView {

    private controllerSelectorView = new ControllerSelector()
    private selectors = new Map<string, AxisSelector>()

    constructor(controller: ControlsController) {
        super(controller);

        this.addSubtitle("Обнаруженные контроллеры")

        this.element.append(this.controllerSelectorView.element)

        this.addButton("Настройки контроллера").stretch().blue()

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
        this.addAxisSelector("Список игроков", "game-player-list")
        this.addAxisSelector("Пауза", "game-pause")

        this.addSubtitle("Сброс")
        this.addButton("Настройки по умолчанию").stretch().red()

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
        let device = ControlsManager.getInstance().devices[index]
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

export default class ControlsController extends GamePauseViewController {
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