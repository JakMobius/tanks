/* @load-resource: ./controller-view.scss */

import View from "../../../../ui/view";

export default class ControllerView extends View {

    name: JQuery
    icon: JQuery
    subtitle: JQuery

    constructor() {
        super();

        this.name = $("<div>").addClass("controller-name")
        this.icon = $("<div>").addClass("controller-icon")
        this.subtitle = $("<div>").addClass("controller-subtitle")

        this.element.addClass("controller-view")

        this.element.append(this.name)
        this.element.append(this.icon)
        this.element.append(this.subtitle)
    }

    setName(name: string) {
        this.name.text(name)
        return this
    }

    setIcon(icon: string) {
        this.icon.css("background-image", `url(assets/img/controllers/${icon})`)
        return this
    }

    setSubtitle(subtitle: string) {
        this.subtitle.text(subtitle)
        return this
    }
}