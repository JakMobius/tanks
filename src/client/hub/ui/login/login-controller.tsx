import Controller from "src/client/ui/controller/controller";
import LoginView from "./login-view";
import {HubPage} from "../hub-page";
import View from "src/client/ui/view";

import React from "react";
import ReactDOM from "react-dom/client";

export default class LoginController extends Controller {
    
    root: ReactDOM.Root
    
    constructor(page: HubPage) {
        super();

        this.title = "Вход"
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0])
        this.root.render(<LoginView page={page}/>)
    }
}