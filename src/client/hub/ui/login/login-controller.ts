import Controller from "src/client/ui/controller/controller";
import LoginView from "./login-view";
import {HubPage} from "../hub-page";

export default class LoginController extends Controller {
    loginView: LoginView
    private page: HubPage;
    
    constructor(page: HubPage) {
        super();
        this.page = page

        this.loginView = new LoginView(page)
        this.title = "Вход"
        this.view = this.loginView

        this.loginView.title.element.text("Вход")
    }
}