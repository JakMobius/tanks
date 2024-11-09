/* @load-resource: './overlay.scss' */

import View from "src/client/ui/view";

export default class Overlay extends View {
    public shown = false;
    public root: JQuery;

    constructor() {
        super()
        this.element.addClass("overlay")
        this.element.hide()
    }

    show(): boolean {
        if (this.shown) return false

        this.shown = true
        this.element.show()
        this.emit("open")

        return true
    }

    hide(): boolean {
        if (!this.shown) return false

        this.shown = false
        this.element.hide()
        this.emit("close")

        return true
    }

    static menu() {
        return $("<div>").addClass("menu")
    }
}