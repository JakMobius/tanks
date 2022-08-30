import LoginPasswordView from "../login-password-view/login-password-view";
import {TipStyle} from "../input-tip-list/input-tip-list-view";
import {HubPage} from "../hub-page";
import Button from "../../../ui/button/button";

export default class LoginView extends LoginPasswordView {
    loginButton = new Button("Вход").largeStyle()
    forgetPasswordButton = new Button("Забыли пароль?").secondaryStyle()

    constructor(page: HubPage) {
        super(page);

        this.buttonContainer.append(this.loginButton.element, this.forgetPasswordButton.element)

        this.loginButton.element.on("click", () => {
            $.ajax({
                url: "ajax/login",
                method: "post",
                data: {
                    login: this.loginInput.input.val(),
                    password: this.passwordInput.input.val()
                }
            }).done((result) => {
                this.parseResult(result)
            }).fail((xhr, exception) => this.page.handleAjaxError(xhr, exception))
        })

        this.passwordInput.input.on("input", () => this.resetTips());
        this.loginInput.input.on("input", () => this.resetTips());
    }

    private parseResult(result: any) {
        switch (result.result) {
            case 'ok':                  this.loginSuccessful();    break;
            case 'invalid-credentials': this.invalidCredentials(); break;
            default: break;
        }
    }

    private parseError(result: any) {

    }

    private loginSuccessful() {
        window.location.reload()
    }

    private invalidCredentials() {
        this.loginInput.tips.setTips([{
            text: "Неверный позывной или пароль",
            style: TipStyle.ERROR
        }])
    }

    private resetTips() {
        this.loginInput.tips.setTips([])
    }
}