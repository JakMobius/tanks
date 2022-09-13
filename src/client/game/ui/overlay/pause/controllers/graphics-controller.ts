import {PauseMenuView} from "../pause-menu-view";
import GamePauseViewController from "./pause-view-controller";
import PreferenceSelector from "../../../preference-selector/preference-selector";

export class GraphicsView extends PauseMenuView {
    constructor(controller: GraphicsController) {
        super(controller);

        this.element.append(new PreferenceSelector("Качество рендера")   .setValue("x2")     .element)
        this.element.append(new PreferenceSelector("Тени на танках")     .setValue("Вкл.")   .element)
        this.element.append(new PreferenceSelector("Закругление гусениц").setValue("Вкл.")   .element)
        this.element.append(new PreferenceSelector("Сглаживание")        .setValue("MSAA 4x").element)
        this.element.append(new PreferenceSelector("Кадровый таймер")    .setValue("RAF")    .element)

        this.addButton("Взглянуть на мир")
        this.addButton("Запустить бенчмарк").red()

        let text = $("<div>")
            .addClass("bottom-text")
            .text("Нет, у тебя серьезно проблемы с производительностью в этой игре? Зачем может вообще потребоваться заходить сюда?")
        this.element.append(text)
    }
}

export default class GraphicsController extends GamePauseViewController {
    constructor() {
        super();
        this.title = "Графика"
        this.view = new GraphicsView(this)
    }
}