import Controller from "src/client/ui/controller/controller";
import {HubPage} from "../hub-page";
import AccountBarButton from "../account-bar-button/account-bar-button";
import GameCreateViewComponent from "./game-create-view";

import React from "react";
import ReactDOM from "react-dom/client";
import View from "src/client/ui/view";

export default class GameCreateController extends Controller {

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
        this.root.render(<GameCreateViewComponent page={page}/>)
    }
}