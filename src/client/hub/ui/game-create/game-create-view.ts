import View from "../../../ui/view";
import {HubPage} from "../hub-page";

export default class GameCreateView extends View {
    private page: HubPage;

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("room-list-view")

        const box = $("<div>").addClass("room-list-box")
        const container = $("<div>").addClass("room-list-container")
        const header = $("<div>").addClass("room-list-header")
        const title = $("<div>").addClass("room-list-title").text("Создать игру")

        header.append(title)
        container.append(header)
        box.append(container)
        this.element.append(box)
    }
}