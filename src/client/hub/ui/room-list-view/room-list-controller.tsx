import Controller from "src/client/ui/controller/controller";
import {HubPage} from "../hub-page";
import AccountBarButton from "../account-bar-button/account-bar-button";

import React from "react";
import ReactDOM from "react-dom/client";

import { RoomListViewComponent } from "./room-list-view";
import View from "src/client/ui/view";

export default class RoomListController extends Controller {

    page: HubPage;
    userButton = new AccountBarButton()
    root: ReactDOM.Root

    constructor(page: HubPage) {
        super();

        this.page = page
        this.rightBarItems = [this.userButton]
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0])
        this.root.render(<RoomListViewComponent page={page}/>)
    }
}