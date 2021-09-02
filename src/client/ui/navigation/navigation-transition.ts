import BasicNavigationView from "./basic-navigation-view";
import NavigationBlock from "./navigation-block";

export default abstract class NavigationTransition {
    abstract performForwardTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, callback: () => void): void
    abstract performBackwardTransition(view: BasicNavigationView, from: NavigationBlock, to: NavigationBlock, callback: () => void): void
}