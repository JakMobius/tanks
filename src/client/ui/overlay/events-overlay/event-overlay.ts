/* @load-resource: './event-overlay.scss' */

import EventView from './event-view';
import BasicEventView from "src/client/ui/overlay/events-overlay/basic-event-view";
import View from "src/client/ui/view";

export default class EventOverlay extends View {
    constructor() {
        super()
        this.element.addClass("event-overlay")
    }

    cascade() {
        let bottom = 10;

        let children = this.element.children(".event-view")

        for(let i = children.length - 1; i >= 0; i--) {
            let child = children[i]
            child.style.bottom = bottom + "px";
            bottom += child.clientHeight + 10;
        }
    }

    createEvent(event: EventView): void
    createEvent(text: string): void
    createEvent(event: string | EventView) {
        if(typeof event === "string") {
            let view = new BasicEventView(event)
            view.setEventContainer(this)
            view.appear()
        } else {
            event.setEventContainer(this)
            event.appear()
        }
    }
}