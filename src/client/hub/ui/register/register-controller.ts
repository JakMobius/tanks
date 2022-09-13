import Controller from "src/client/ui/controller/controller";
import RegisterView from "../register/register-view";
import {HubPage} from "../hub-page";

export default class RegisterController extends Controller {
    registerView: RegisterView
    page: HubPage

    constructor(page: HubPage) {
        super();
        this.page = page
        this.title = "Регистрация"
        this.registerView = new RegisterView(this.page)
        this.view = this.registerView
    }
}