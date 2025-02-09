import './pause-menu-view.scss'

import View from "src/client/ui/view";
import Controller from "src/client/ui/controller/controller";
import NavigationCloud from 'src/client/game/ui/cloud/navigation-cloud';
import PauseNavigationTransition from './navigation/pause-navigation-transition';

export class PauseMenuView extends View {

    controller: Controller

    constructor(controller: Controller) {
        super();
        this.controller = controller
        this.element.addClass("pause-menu-view")
    }

    addButton(text: string) {
        let button = new NavigationCloud(this.controller).text(text).button().transition(() => {
            return new PauseNavigationTransition()
        })
        button.element.addClass("pause-menu-button")
        this.element.append(button.element)
        return button
    }

    addSubtitle(text: string) {
        let subtitle = $("<div>").addClass("subtitle").text(text)
        this.element.append(subtitle)
        return subtitle
    }
}