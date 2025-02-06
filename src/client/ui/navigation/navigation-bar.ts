import './navigation-bar.scss'

import View from "../view";

export default class NavigationBar extends View {
    leftElement: JQuery
    rightElement: JQuery

    constructor() {
        super();
        this.element.addClass("navigation-bar")
        this.leftElement = $("<div>").addClass("item-container")
        this.rightElement = $("<div>").addClass("item-container")

        this.element.append(this.leftElement)
        this.element.append(this.rightElement)
    }
}