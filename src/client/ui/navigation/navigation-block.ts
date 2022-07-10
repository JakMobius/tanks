/* @load-resource: ./navigation-block.scss */

import View from "../view";
import NavigationBar from "./navigation-bar";
import Controller from "../controller/controller";

export default class NavigationBlock<ControllerClass extends Controller = Controller> extends View {
    topBar = new NavigationBar()
    contentView: JQuery
    bottomBar = new View()
    controller: ControllerClass

    constructor(controller: ControllerClass) {
        super();

        this.controller = controller

        this.element.addClass("navigation-block")
        this.contentView = $("<div>").addClass("content-view")
        this.bottomBar.element.addClass("bottom-bar")
        this.element.append(this.topBar.element, this.contentView, this.bottomBar.element)

        this.contentView.append(controller.view.element)

        this.topBar.leftElement.append(controller.leftBarItems.map(a => a.element))
        this.topBar.rightElement.append(controller.rightBarItems.map(a => a.element))
        this.bottomBar.element.append(controller.bottomBarItems.map(a => a.element))
    }

    onPush() {

    }
}