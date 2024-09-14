/* @load-resource: './event-view.scss' */

import EventOverlay from "src/client/ui/overlay/events-overlay/event-overlay";
import View from "src/client/ui/view";

export default class EventView extends View {
    private eventContainer: EventOverlay;

    constructor() {
        super();
        this.element.addClass("event-view")
    }

    setEventContainer(container: EventOverlay) {
        this.eventContainer = container
    }

    appear() {
        this.element.css("opacity", "0")
        this.addToContainer()
        this.element.css("opacity", "1")
    }

    disappear(callback?: () => void) {
        this.emit("disappear")
        this.element.css("opacity", "0")
        setTimeout(() => {
            this.removeFromContainer()
            callback && callback()
        }, 500)
    }

    protected addToContainer() {
        this.eventContainer.element.append(this.element)
        this.eventContainer.cascade()
    }

    protected removeFromContainer() {
        this.element.remove()
        this.eventContainer.cascade()
    }
}