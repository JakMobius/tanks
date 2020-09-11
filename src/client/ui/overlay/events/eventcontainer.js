/* @load-resource: './event-container.scss' */

const View = require("../../view")
const EventView = require("./eventview")

class EventContainer extends View {
    constructor() {
        super();

        this.element.addClass("event-container")
    }

    cascade() {
        let top = 0;

        let children = this.element.children(".event-view")

        for(let i = children.length - 1; i >= 0; i--) {
            let child = children[i]
            top += child.clientHeight + 10;
            child.style.top = "-" + top + "px";
        }
    }

    createEvent(text) {
        let view = new EventView(text)

        this.element.append(view.element)
        this.cascade()
        view.appear()

        setTimeout(() => {
            view.disappear(() => {
                view.element.remove()
                this.cascade()
            })
        }, 2000)
    }
}

module.exports = EventContainer