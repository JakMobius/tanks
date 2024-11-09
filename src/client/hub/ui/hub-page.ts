/* @load-resource: './hub-page.scss' */

import View from "src/client/ui/view";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import WelcomeController from "./welcome/welcome-controller";
import EventOverlay from "src/client/ui/overlay/events-overlay/event-overlay";
import AuthorizedWelcomeController from "./authorised-welcome/authorized-welcome-controller";
import HubNavigationView from "./hub-navigation-view";
import {localizeAjaxError} from "../localizations";

export class HubPage extends View {
    userData: UserDataRaw;
    dimmer: JQuery
    navigationController = new HubNavigationView()
    eventContainer: EventOverlay

    constructor(userData: UserDataRaw) {
        super();

        this.userData = userData
        this.element.addClass("hub-body")
        this.dimmer = $("<div>").addClass("dimmer")
        this.element.append(this.dimmer)
        this.element.append(this.navigationController.element)

        this.eventContainer = new EventOverlay()
        this.element.append(this.eventContainer.element)

        if(this.userData.username) {
            const playController = new AuthorizedWelcomeController(this)
            this.navigationController.pushController(playController)
        } else {
            const welcomeController = new WelcomeController(this)
            this.navigationController.pushController(welcomeController)
        }
    }


    handleAjaxError(xhr: JQuery.jqXHR, exception: string) {
        let msg = localizeAjaxError(xhr, exception)
        this.eventContainer.createEvent(msg)
    }
}