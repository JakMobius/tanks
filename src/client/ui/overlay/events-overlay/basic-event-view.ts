/* @load-resource: './basic-event-view.scss' */

import EventView from "src/client/ui/overlay/events-overlay/event-view";

export default class BasicEventView extends EventView {

    constructor(text: string) {
        super();
        this.element.addClass("basic-event-view")
        this.element.text(text)
    }

    appear() {
        super.appear();

        setTimeout(() => this.disappear(), 2000)
    }
}