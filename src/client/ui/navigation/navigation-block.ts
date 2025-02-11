import './navigation-block.scss'

import View from "../view";
import Controller from "../controller/controller";

export default class NavigationBlock<ControllerClass extends Controller = Controller> extends View {
    contentView: JQuery
    bottomBar = new View()
    controller: ControllerClass

    constructor(controller: ControllerClass) {
        super();

        this.controller = controller

        this.element.addClass("navigation-block")
        this.contentView = $("<div>").addClass("content-view")
        this.bottomBar.element.addClass("bottom-bar")

        this.contentView.append(controller.view.element)
        this.bottomBar.element.append(controller.bottomBarItems.map(a => a.element))
    }

    onPush() {

    }
}