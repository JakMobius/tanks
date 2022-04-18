/* @load-resource: './login-password-view.scss' */

import View from "../../../ui/view";
import AuthInput from "../auth-input/auth-input";
import AuthTitle from "../auth-title/auth-title";
import {HubPage} from "../hub-page";

export default class LoginPasswordView extends View {

    title = new AuthTitle()
    fieldContainer = $("<div>").addClass("field-container")
    loginInput = new AuthInput()
    passwordInput = new AuthInput()
    buttonContainer = $("<div>").addClass("auth-button-container")
    page: HubPage

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("login-password-view")
        this.fieldContainer.append(this.loginInput.element, this.passwordInput.element)
        this.element.append(this.title.element, this.fieldContainer, this.buttonContainer)

        this.loginInput.setPlaceholder("Позывной")
        this.passwordInput.setPlaceholder("••••••••••")
        this.loginInput.input.attr("type", "")
        this.passwordInput.input.attr("type", "password")

        this.loginInput.addTips()
        this.passwordInput.addTips()
    }
}