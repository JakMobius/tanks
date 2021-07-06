
import Controller from "../../../ui/controller/controller";
import {HubPage} from "../hub-page";
import AuthorizedWelcomeView from "./authorized-welcome-view";
import AccountBarButton from "../account-bar-button/account-bar-button";

export default class AuthorizedWelcomeController extends Controller {
    page: HubPage;
    userButton = new AccountBarButton()

    constructor(page: HubPage) {
        super();

        this.page = page
        this.userButton.setUsername(this.page.userData.username)
        this.rightBarItems = [this.userButton]
        this.view = new AuthorizedWelcomeView(page)

    }
}