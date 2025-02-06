import './pause-menu-view.scss'

import View from "src/client/ui/view";
import PauseNavigationCloud from "src/client/ui/overlay/pause-overlay/elements/pause-navigation-cloud";
import Controller from "src/client/ui/controller/controller";

export class PauseMenuView extends View {

    controller: Controller

    constructor(controller: Controller) {
        super();
        this.controller = controller
        this.element.addClass("pause-menu-view")
    }

    addButton(text: string) {
        let button = new PauseNavigationCloud(this.controller).text(text).button()
        button.element.addClass("pause-menu-button")
        this.element.append(button.element)
        return button
    }

    addSubtitle(text: string) {
        let subtitle = $("<div>").addClass("subtitle").text(text)
        this.element.append(subtitle)
        return subtitle
    }
}