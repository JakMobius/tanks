/* @load-resource: './account-bar-button.scss' */

import View from "src/client/ui/view";

export default class AccountBarButton extends View {

    image = $("<div>").addClass("account-image")
    nick = $("<div>").addClass("account-nickname")

    constructor() {
        super();

        this.element.addClass("account-bar-button")
        this.element.append(this.image, this.nick)
    }

    setUsername(username: string) {
        this.nick.text(username)
        this.image.css("background-image", "url(ajax/profile-image?username=" + encodeURIComponent(username) + ")")
    }
}