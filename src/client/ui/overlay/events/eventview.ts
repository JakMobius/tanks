/* @load-resource: './event-view.scss' */

import View from '../../view';

class EventView extends View {
    constructor(text: string) {
        super();

        this.element.addClass("menu event-view")
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

export default EventView;