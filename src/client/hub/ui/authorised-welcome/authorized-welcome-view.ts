/* @load-resource: 'authorized-welcome.scss' */

import View from "../../../ui/view";
import {HubPage} from "../hub-page";
import LargePlayButton from "../large-play-button/large-play-button";
import Button from "../../../ui/button/button";

export default class AuthorizedWelcomeView extends View {
    private page: HubPage;
    button = new LargePlayButton()
    roomListButton = new Button("Игровые комнаты").secondaryStyle()

    constructor(page: HubPage) {
        super();
        this.page = page

        this.element.addClass("authorized-welcome-view")
        this.element.append(this.button.element, this.roomListButton.element)

        this.roomListButton.element.on("click", () => this.emit("navigate-to-room-list"))
    }
}