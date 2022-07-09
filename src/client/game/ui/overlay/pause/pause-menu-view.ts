/* @load-resource: ./pause-menu-view.scss */

import View from "../../../../ui/view";
import NavigationCloud from "../../cloud/navigation-cloud";
import Controller from "../../../../ui/controller/controller";

export class PauseMenuView extends View {

    controller: Controller

    constructor(controller: Controller) {
        super();
        this.controller = controller
        this.element.addClass("pause-menu-view")
    }

    addButton(text: string) {
        let button = new NavigationCloud(this.controller).text(text).button().stretch()
        this.element.append(button.element)
        return button
    }

    addSubtitle(text: string) {
        let subtitle = $("<div>").addClass("subtitle").text(text)
        this.element.append(subtitle)
        return subtitle
    }


    onFocus() {

    }

    onBlur() {

    }
}