import LoginPasswordView from "../login-password-view/login-password-view";
import {HubPage} from "../hub-page";
import {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import {checkNick} from "../../../../utils/nick-checker";
import {textFromNickCheckResult} from "../../localizations";
import {passwordScore} from "../../../../utils/password-checker";

export default class RegisterView extends LoginPasswordView {

    registerButton = $("<button>")
        .addClass("large")
        .text("Регистрация")
        .prop("disabled", true)
    registerButtonEnabled: boolean = false
    passwordCorrect: boolean = false
    usernameCorrect: boolean = false

    constructor(page: HubPage) {
        super(page);

        this.buttonContainer.append(this.registerButton)

        this.title.element.text("Регистрация")

        this.loginInput.input.on("input", () => this.checkLogin())
        this.passwordInput.input.on("input", () => this.checkPassword())

        this.registerButton.on("click", () => {
            $.ajax({
                url: "ajax/register",
                method: "post",
                data: {
                    login: this.loginInput.input.val(),
                    password: this.passwordInput.input.val()
                }
            }).done((result) => {
                this.handleResult(result)
            }).fail((xhr, exception) => this.page.handleAjaxError(xhr, exception))
        })
    }

    private handleResult(result: any) {
        switch(result.result) {
            case "ok": this.onSuccessfulRegister(); break;
            case "login-used": this.onLoginUsed(); break;
            case "check-login": this.checkLogin(); break;
            case "check-password": this.checkPassword(); break;
        }
    }

    private updateButtonState() {
        let buttonEnabled = this.usernameCorrect && this.passwordCorrect
        if(this.registerButtonEnabled == buttonEnabled) return
        this.registerButtonEnabled = buttonEnabled
        this.registerButton.prop("disabled", !this.registerButtonEnabled)
    }

    private setUsernameCorrect(correct: boolean) {
        this.usernameCorrect = correct
        this.updateButtonState()
    }

    private setPasswordCorrect(correct: boolean) {
        this.passwordCorrect = correct
        this.updateButtonState()
    }

    private checkLogin() {
        let nick = this.loginInput.input.val() as string;
        let tips: Tip[] = checkNick(nick).map(a => {
            return {
                text: textFromNickCheckResult(a),
                style: TipStyle.ERROR
            }
        })
        this.setUsernameCorrect(tips.length == 0)
        this.loginInput.tips.setTips(tips)
    }

    private checkPassword() {
        let nick = this.passwordInput.input.val() as string;
        let score = passwordScore(nick)
        let tip: Tip = { text: null, style: null }
        let passwordCorrect = true

        if(score < 35) {
            passwordCorrect = false
            tip.style = TipStyle.ERROR
            tip.text = "Это разве пароль?"
        } else if(score < 55) {
            tip.style = TipStyle.WARNING
            tip.text = "Простой пароль"
        } else if(score < 75) {
            tip.style = TipStyle.WEAK_WARNING
            tip.text = "Неплохой пароль"
        } else {
            tip.style = TipStyle.FINE
            tip.text = "Непробиваемый пароль"
        }

        this.setPasswordCorrect(passwordCorrect)

        this.passwordInput.tips.setTips([tip])
    }

    private onSuccessfulRegister() {

    }

    private onLoginUsed() {
        this.loginInput.tips.setTips([{
            text: "Этот позывной уже кем-то занят",
            style: TipStyle.ERROR
        }])
    }
}