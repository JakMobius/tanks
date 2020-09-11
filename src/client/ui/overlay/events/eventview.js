/* @load-resource: './event-view.scss' */

const View = require("../../view")

class EventView extends View {
    constructor(text) {
        super();

        this.element.addClass("menu event-view")
        this.element.css("opacity", "0")
        this.element.text(text)
    }

    appear() {
        this.element.css("opacity", "1")
    }

    disappear(callback) {
        this.element.css("opacity", "0")
        setTimeout(callback, 500)
    }
}

module.exports = EventView