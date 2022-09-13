import Controller from "../../../ui/controller/controller";
import {HubPage} from "../hub-page";
import AuthorizedWelcomeView from "./authorized-welcome-view";
import AccountBarButton from "../account-bar-button/account-bar-button";
import RoomListController from "../room-list-view/room-list-controller";

export default class AuthorizedWelcomeController extends Controller {
    page: HubPage;
    userButton = new AccountBarButton()

    constructor(page: HubPage) {
        super();

        this.page = page
        this.userButton.setUsername(this.page.userData.username)
        this.rightBarItems = [this.userButton]
        this.view = new AuthorizedWelcomeView(page)
        this.view.on("navigate-to-room-list", () => this.navigateToRoomList())

    }

    navigateToRoomList() {
        this.navigationView.pushController(new RoomListController(this.page))
    }
}