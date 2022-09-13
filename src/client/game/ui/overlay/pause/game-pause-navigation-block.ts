/* @load-resource: ./game-pause-navigation-block.scss */

import Cloud from "src/client/game/ui/cloud/cloud";
import NavigationBlock from "src/client/ui/navigation/navigation-block";
import GamePauseViewController from "./controllers/pause-view-controller";

export default class GamePauseNavigationBlock extends NavigationBlock<GamePauseViewController> {
    private backButton = new Cloud().round().button();

    constructor(controller: GamePauseViewController) {
        super(controller)

        this.element.addClass("pause-navigation-block")
        this.backButton.element.on("click", () => this.controller.navigateBack())

        this.backButton.text(controller.title)
        this.topBar.leftElement.prepend(this.backButton.element)
    }

    onPush() {
        super.onPush();

        if(this.controller.navigationView.stack.length > 1) this.backButton.leftArrowed()
    }
}