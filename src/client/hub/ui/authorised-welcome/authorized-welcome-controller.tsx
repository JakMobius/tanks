import Controller from "src/client/ui/controller/controller";
import {HubPage} from "../hub-page";
import AuthorizedWelcomeView from "./authorized-welcome-view";
import AccountBarButton from "../account-bar-button/account-bar-button";
import RoomListController from "../room-list-view/room-list-controller";

import React from "react";
import ReactDOM from 'react-dom/client';
import View from "src/client/ui/view";

export default class AuthorizedWelcomeController extends Controller {
    page: HubPage;
    userButton = new AccountBarButton()
    root: ReactDOM.Root

    constructor(page: HubPage) {
        super();

        this.page = page
        this.userButton.setUsername(this.page.userData.username)
        this.rightBarItems = [this.userButton]
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0])
        this.root.render(<AuthorizedWelcomeView
            onNavigateToRoomList={() => this.navigateToRoomList()}
        />)
    }

    navigateToRoomList() {
        this.navigationView.pushController(new RoomListController(this.page))
    }
}