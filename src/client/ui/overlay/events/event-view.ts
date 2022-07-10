/* @load-resource: './event-view.scss' */

import Menu from "../../menu/menu";

export default class EventView extends Menu {
    constructor(text: string) {
        super();

        this.element.addClass("event-view")
        this.element.css("opacity", "0")
        this.element.text(text)
    }

    appear() {
        this.element.css("opacity", "1")
    }

    disappear(callback: () => void) {
        this.element.css("opacity", "0")
        setTimeout(callback, 500)
    }
}