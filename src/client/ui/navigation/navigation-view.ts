/* @load-resource: './navigation.scss' */

import View from "../view";
import NavigationBar from "./navigation-bar";
import Controller from "../controller/controller";

export default class NavigationView extends View {

    topBar = new NavigationBar()
    contentView: JQuery
    bottomBar = new View()
    stack: Controller[] = []
    backButton = $("<button>").addClass("navigation-back-button")

    constructor() {
        super();

        this.element.addClass("navigation-view")

        this.contentView = $("<div>").addClass("content-view")

        this.element.append(this.topBar.element, this.contentView, this.bottomBar.element)
        this.backButton.on("click", () => this.popController())
    }

    pushController(controller: Controller) {
        controller.navigationView = this
        this.stack.push(controller)
        this.updateController(controller)
    }

    popController() {
        this.stack.pop()
        this.updateController(this.stack[this.stack.length - 1])
    }

    updateController(controller: Controller) {
        this.topBar.leftElement.children().detach()
        this.topBar.rightElement.children().detach()
        this.bottomBar.element.children().detach()
        this.contentView.children().detach()

        if(this.stack.length > 1) {
            let previousController = this.stack[this.stack.length - 2]
            if(previousController.title) {
                this.backButton.text(previousController.title)
            } else {
                this.backButton.text("Назад")
            }

            this.topBar.leftElement.append(this.backButton)
        }

        this.topBar.leftElement.append(controller.leftBarItems.map(a => a.element))
        this.topBar.rightElement.append(controller.rightBarItems.map(a => a.element))
        this.bottomBar.element.append(controller.bottomBarItems.map(a => a.element))

        this.contentView.append(controller.view.element);
    }

}