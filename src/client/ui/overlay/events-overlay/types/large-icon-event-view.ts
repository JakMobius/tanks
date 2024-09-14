/* @load-resource: './large-icon-event-view.scss' */

import EventView from "src/client/ui/overlay/events-overlay/event-view";

export default class LargeIconEventView extends EventView {

    protected icon = $("<div>").addClass("event-icon")
    protected text = $("<div>").addClass("event-text")
    protected title = $("<div>").addClass("event-title")
    protected subtitle = $("<div>").addClass("event-subtitle")

    constructor() {
        super();
        this.element.addClass("large-icon-event-view")
        this.element.append(this.icon)
        this.element.append(this.text)
        this.text.append(this.title)
        this.text.append(this.subtitle)
    }
}