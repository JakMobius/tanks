/* @load-resource: './hub-page.scss' */

import View from "../../ui/view";
import {UserDataRaw} from "../../user-data-raw";
import NavigationView from "../../ui/navigation/navigation-view";
import WelcomeController from "./welcome/welcome-controller";
import EventContainer from "../../ui/overlay/events/event-container";
import AuthorizedWelcomeController from "./authorised-welcome/authorized-welcome-controller";

export class HubPage extends View {
    userData: UserDataRaw;
    dimmer: JQuery
    navigationController = new NavigationView()
    eventContainer = new EventContainer()

    constructor(userData: UserDataRaw) {
        super();
        this.userData = userData
        this.element.addClass("hub-body")
        this.dimmer = $("<div>").addClass("dimmer")
        this.element.append(this.dimmer)
        this.element.append(this.navigationController.element)
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
        let msg = ""

        if (xhr.status === 0) {
            msg = 'Не удалось выполнить подключение к серверу. Убедитесь, что с вашим интернетом все в порядке.';
        } else if (xhr.status >= 500 && xhr.status <= 599) {
            msg = 'Сервер прилёг отдохнуть. Пожалуйста, сообщите об этом разработчикам. Пусть разбудят. (Ошибка ' + xhr.status + ')';
        } else if (xhr.status >= 400 && xhr.status <= 499) {
            msg = 'Не удалось выполнить запрос. Серверу он почему-то не понравился. Обратитесь за помощью к разработчикам. (Ошибка' + xhr.status + ')'
        }  else if (exception === 'parsererror') {
            msg = 'Произошла ошибка разбора при выполении запроса. Как это вообще могло произойти?...';
        } else if (exception === 'timeout') {
            msg = 'Не удалось выполнить запрос. Истекло время ожидания.';
        } else if (exception === 'abort') {
            msg = 'Не удалось выполнить запрос, так как он был отменен';
        } else {
            msg = 'Не удалось выполнить запрос: ' + xhr.responseText;
        }

        this.eventContainer.createEvent(msg)
    }
}