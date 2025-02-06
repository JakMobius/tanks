import './pause-navigation-view.scss'

import BasicNavigationView from "src/client/ui/navigation/basic-navigation-view";

export default class PauseNavigationView extends BasicNavigationView {
    constructor() {
        super();
        this.element.addClass("pause-navigation-view");
    }
}