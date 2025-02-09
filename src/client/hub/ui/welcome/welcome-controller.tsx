import Controller from "src/client/ui/controller/controller";
import {HubPage} from "../hub-page";
import RegisterController from "../register/register-controller";
import LoginController from "../login/login-controller";
import WelcomeView from "./welcome-view";
import BarSeparator from "../bar-separator/bar-separator";
import Button from "src/client/ui/button/button";
import PageLocation from "src/client/scenes/page-location";

import React from "react";
import ReactDOM from 'react-dom/client';
import View from "src/client/ui/view";

export default class WelcomeController extends Controller {

    loginButton = new Button("Вход").secondaryStyle()
    registerButton = new Button("Регистрация").secondaryStyle()
    howToPlayButton = new Button("Как играть?").secondaryStyle()
    page: HubPage;

    root: ReactDOM.Root

    constructor(page: HubPage) {
        super();

        this.page = page
        this.rightBarItems = [this.loginButton, new BarSeparator(), this.registerButton]
        this.bottomBarItems = [this.howToPlayButton]
        
        this.view = new View()
        this.root = ReactDOM.createRoot(this.view.element[0])
        this.root.render(<WelcomeView/>)

        this.registerButton.element.on("click", () => this.navigateToRegisterMenu())
        this.loginButton.element.on("click", () => this.navigateToLoginMenu())

        this.howToPlayButton.element.on("click", () => {
            PageLocation.navigateToScene("tutorial")
        })
    }

    private navigateToRegisterMenu() {
        if(this.navigationView)
            this.navigationView.pushController(new RegisterController(this.page))
    }

    private navigateToLoginMenu() {
        if(this.navigationView)
            this.navigationView.pushController(new LoginController(this.page))
    }
}