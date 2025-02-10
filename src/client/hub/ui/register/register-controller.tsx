import Controller from "src/client/ui/controller/controller";
import RegisterView from "../register/register-view";
import {HubPage} from "../hub-page";

import React from "react";
import ReactDOM from "react-dom/client";
import View from "src/client/ui/view";

export default class RegisterController extends Controller {
    root: ReactDOM.Root

    constructor(page: HubPage) {
        super();
        this.title = "Регистрация"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0])
        this.root.render(<RegisterView page={page}/>)
    }
}