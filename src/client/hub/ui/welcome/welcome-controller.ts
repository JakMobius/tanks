import Controller from "src/client/ui/controller/controller";
import {HubPage} from "../hub-page";
import RegisterController from "../register/register-controller";
import LoginController from "../login/login-controller";
import WelcomeView from "./welcome-view";
import BarSeparator from "../bar-separator/bar-separator";
import Button from "src/client/ui/button/button";

export default class WelcomeController extends Controller {

    loginButton = new Button("Вход").secondaryStyle()
    registerButton = new Button("Регистрация").secondaryStyle()
    howToPlayButton = new Button("Как играть?").secondaryStyle()
    page: HubPage;

    constructor(page: HubPage) {
        super();

        this.page = page
        this.rightBarItems = [this.loginButton, new BarSeparator(), this.registerButton]
        this.bottomBarItems = [this.howToPlayButton]
        this.view = new WelcomeView(page)

        this.registerButton.element.on("click", () => this.navigateToRegisterMenu())
        this.loginButton.element.on("click", () => this.navigateToLoginMenu())

        this.howToPlayButton.element.on("click", () => {
            window.location.href = "../tutorial"
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