/* @load-resource: './loading-view.scss' */

import View from "src/client/ui/view";

export default class LoadingView extends View {

    icon: JQuery
    title: JQuery
    subtitle: JQuery

    constructor() {
        super()
        this.element = $("<div>").addClass("loading-container")

        this.icon = $("<div>").addClass("loading-icon")
        this.title = $("<div>").addClass("loading-title")
        this.subtitle = $("<div>").addClass("loading-subtitle")

        this.element.append(this.icon, this.title, this.subtitle)
    }

    setTitle(title: string) {
        this.title.text(title)
        return this
    }

    setSubtitle(subtitle: string) {
        this.subtitle.text(subtitle)
        return this
    }

    show() {
        this.element.show()
    }

    hide() {
        this.element.hide()
    }
}