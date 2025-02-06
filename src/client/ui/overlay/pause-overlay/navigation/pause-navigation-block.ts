import './pause-navigation-block.scss'

import Cloud from "src/client/game/ui/cloud/cloud";
import NavigationBlock from "src/client/ui/navigation/navigation-block";
import PauseViewController from "src/client/ui/overlay/pause-overlay/controllers/pause-view-controller";

export default class PauseNavigationBlock extends NavigationBlock<PauseViewController> {
    private backButton = new Cloud().round().button();

    constructor(controller: PauseViewController) {
        super(controller)

        this.element.addClass("pause-navigation-block")
        this.backButton.element.addClass("pause-navigation-button")
        this.backButton.element.on("click", () => this.controller.navigateBack())

        this.backButton.text(controller.title)
        this.topBar.leftElement.prepend(this.backButton.element)
    }

    onPush() {
        super.onPush();

        if(this.controller.navigationView.stack.length > 1) this.backButton.leftArrowed()
    }
}