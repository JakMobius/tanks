/* @load-resource: './button.scss' */

import View from "../view";

export default class Button extends View {
    static tagName = "<button>"

    constructor(text: string = null) {
        super();
        if(text) this.element.text(text)
    }

    largeStyle() {
        this.element.addClass("large")
        return this
    }

    secondaryStyle() {
        this.element.addClass("secondary")
        return this
    }
}