import Controller from "../../../ui/controller/controller";
import {HubPage} from "../hub-page";
import AccountBarButton from "../account-bar-button/account-bar-button";

import RoomListView from "./room-list-view";

export default class RoomListController extends Controller {

    page: HubPage;
    userButton = new AccountBarButton()

    constructor(page: HubPage) {
        super();

        this.page = page
        this.userButton.setUsername(this.page.userData.username)
        this.rightBarItems = [this.userButton]
        this.view = new RoomListView(page)

    }
}