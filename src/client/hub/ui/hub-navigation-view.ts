/* @load-resource: ./hub-navigation-view.scss */

import BasicNavigationView from "../../ui/navigation/basic-navigation-view";
import HubNavigationBlock from "./hub-navigation-block";

export default class HubNavigationView extends BasicNavigationView {
    constructor() {
        super();
        this.blockClass = HubNavigationBlock
        this.element.addClass("hub-navigation-view");
    }
}