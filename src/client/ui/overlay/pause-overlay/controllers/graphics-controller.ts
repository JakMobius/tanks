import {PauseMenuView} from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";
import PauseSelectRow from "src/client/ui/overlay/pause-overlay/elements/pause-select-row";

export class GraphicsView extends PauseMenuView {
    constructor(controller: GraphicsController) {
        super(controller);

        this.element.append(new PauseSelectRow("Качество рендера")   .setValue("x2")     .element)
        this.element.append(new PauseSelectRow("Тени на танках")     .setValue("Вкл.")   .element)
        this.element.append(new PauseSelectRow("Закругление гусениц").setValue("Вкл.")   .element)
        this.element.append(new PauseSelectRow("Сглаживание")        .setValue("MSAA 4x").element)
        this.element.append(new PauseSelectRow("Кадровый таймер")    .setValue("RAF")    .element)

        this.addButton("Взглянуть на мир")
        this.addButton("Запустить бенчмарк").red()

        let text = $("<div>")
            .addClass("bottom-text")
            .text("Нет, у тебя серьезно проблемы с производительностью в этой игре? Зачем может вообще потребоваться заходить сюда?")
        this.element.append(text)
    }
}

export default class GraphicsController extends PauseViewController {
    constructor() {
        super();
        this.title = "Графика"
        this.view = new GraphicsView(this)
    }
}