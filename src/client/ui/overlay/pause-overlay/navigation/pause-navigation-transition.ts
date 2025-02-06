import './pause-navigation-transition.scss'

import NavigationTransition from "src/client/ui/navigation/navigation-transition";
import BasicNavigationView from "src/client/ui/navigation/basic-navigation-view";
import NavigationBlock from "src/client/ui/navigation/navigation-block";
import NavigationCloud from "../../../../game/ui/cloud/navigation-cloud";

export default class PauseNavigationTransition extends NavigationTransition {
    protected cloud: NavigationCloud;
    transitionDuration: number = 0.5

    constructor(cloud: NavigationCloud) {
        super();
        this.cloud = cloud
    }

    protected performTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, reverse: boolean, callback: () => void) {
        if(reverse) view.element.append(from.element)
        else view.element.append(to.element)

        let easing = reverse ? "ease-in" : "ease-out"

        from.element.css("animation-name", `pause-navigation-slide-out`)
        to.element.css("animation-name", `pause-navigation-slide-in`)

        from.element.css("animation-duration", `${this.transitionDuration}s`)
        to.element.css("animation-duration", `${this.transitionDuration}s`)

        from.element.css("animation-timing-function", easing)
        to.element.css("animation-timing-function", easing)

        if(reverse) {
            from.element.css("animation-direction", "reverse")
            to.element.css("animation-direction", "reverse")
            from.element.css("animation-fill-mode", "backwards")
            to.element.css("animation-fill-mode", "backwards")
        } else {
            from.element.css("animation-direction", "forward")
            to.element.css("animation-direction", "forward")
            from.element.css("animation-fill-mode", "forwards")
            to.element.css("animation-fill-mode", "forwards")
        }

        const completionHandler = () => {
            from.element.off("animationend", completionHandler)

            from.element.css("animation", "")
            to.element.css("animation", "")

            if(reverse) to.element.detach()
            else from.element.detach()
            callback()
        }

        from.element.on("animationend", completionHandler)
    }

    performForwardTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, callback: () => void): void {
        this.performTransition(view, from, to, false, callback)
    }

    performBackwardTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, callback: () => void): void {
        this.performTransition(view, to, from, true, callback)
    }
}