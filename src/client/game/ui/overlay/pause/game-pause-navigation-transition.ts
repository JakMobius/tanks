/* @load-resource: ./game-pause-navigation-transition.scss */

import NavigationTransition from "src/client/ui/navigation/navigation-transition";
import BasicNavigationView from "src/client/ui/navigation/basic-navigation-view";
import NavigationBlock from "src/client/ui/navigation/navigation-block";
import NavigationCloud from "src/client/game/ui/cloud/navigation-cloud";

export default class GamePauseNavigationTransition extends NavigationTransition {
    private cloud: NavigationCloud;

    constructor(cloud: NavigationCloud) {
        super();
        this.cloud = cloud
    }

    private setNoMargin(element: JQuery) {
        let margin = -element.outerWidth() / 2 + "px"
        element.css("margin-left", margin)
        element.css("margin-right", margin)
    }

    private resetNoMargin(element: JQuery) {
        element.css("margin-left", "0")
        element.css("margin-right", "0")
    }

    private performTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, reverse: boolean, callback: () => void) {
        if(reverse) view.element.append(from.element)
        else view.element.append(to.element)

        this.setNoMargin(from.element)
        this.setNoMargin(to.element)

        from.element.css("animation", "pause-navigation-slide-out 0.3s ease-in-out")
        to.element.css("animation", "pause-navigation-slide-in 0.3s ease-in-out")

        if(reverse) {
            from.element.css("animation-direction", "reverse")
            to.element.css("animation-direction", "reverse")
        }

        setTimeout(() => {
            from.element.css("animation", "")
            to.element.css("animation", "")

            this.resetNoMargin(from.element)
            this.resetNoMargin(to.element)

            if(reverse) to.element.detach()
            else from.element.detach()
            callback()
        }, 300)
    }

    performForwardTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, callback: () => void): void {
        this.performTransition(view, from, to, false, callback)
    }

    performBackwardTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, callback: () => void): void {
        this.performTransition(view, to, from, true, callback)
    }
}