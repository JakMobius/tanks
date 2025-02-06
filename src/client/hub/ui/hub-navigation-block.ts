import './hub-navigation-block.scss'

import Controller from "src/client/ui/controller/controller";
import NavigationBlock from "src/client/ui/navigation/navigation-block";

export default class HubNavigationBlock extends NavigationBlock {

    constructor(controller: Controller) {
        super(controller);

        this.element.addClass("hub-navigation-block")
    }

    onPush() {
        const navigationView = this.controller.navigationView
        const previousController = navigationView.stack[navigationView.stack.length - 2]

        if(!previousController) return;

        const backButton = $("<button>").addClass("navigation-back-button")

        if(previousController.controller.title) backButton.text(previousController.controller.title)
        else backButton.text("Назад")

        this.topBar.leftElement.prepend(backButton)

        backButton.on("click", () => navigationView.popController())
    }
}