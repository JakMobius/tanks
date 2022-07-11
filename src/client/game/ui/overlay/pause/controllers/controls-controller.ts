import {PauseMenuView} from "../pause-menu-view";
import GamePauseViewController from "./pause-view-controller";
import AxisSelector from "../../../axis-selector/axis-selector";
import ControllerSelector from "../../../controller-selector/controller-selector";

export class ControlsView extends PauseMenuView {
    constructor(controller: ControlsController) {
        super(controller);

        this.addSubtitle("Обнаруженные контроллеры")

        this.element.append(new ControllerSelector().element)

        this.addButton("Настройки контроллера").stretch().blue()

        this.addSubtitle("Управление танком")
        this.element.append(new AxisSelector("Газ")           .setAxes(["W", "↑"]).element)
        this.element.append(new AxisSelector("Тормоз/назад")  .setAxes(["S", "↓"]).element)
        this.element.append(new AxisSelector("Влево")         .setAxes(["A", "←"]).element)
        this.element.append(new AxisSelector("Вправо")        .setAxes(["D", "→"]).element)
        this.element.append(new AxisSelector("Выстрел")       .setAxes(["Пробел"]).element)
        this.element.append(new AxisSelector("Поставить мину").setAxes(["Q"]).element)

        this.addSubtitle("Игровой процесс")
        this.element.append(new AxisSelector("Чат")           .setAxes(["Enter"]).element)
        this.element.append(new AxisSelector("Респавн")       .setAxes(["R"]).element)
        this.element.append(new AxisSelector("Список игроков").setAxes(["Tab"]).element)
        this.element.append(new AxisSelector("Пауза")         .setAxes(["Esc"]).element)

        this.addSubtitle("Сброс")
        this.addButton("Настройки по умолчанию").stretch().red()
    }
}

export default class ControlsController extends GamePauseViewController {
    constructor() {
        super();
        this.title = "Управление"
        this.view = new ControlsView(this)
    }
}