/* @load-resource: './welcome.scss' */

import View from "../../../ui/view";
import InputTipList, {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import {checkNick} from "../../../../utils/nick-checker";
import {textFromNickCheckResult} from "../../localizations";
import AuthInput from "../auth-input/auth-input";
import AuthTitle from "../auth-title/auth-title";
import {HubPage} from "../hub-page";

export default class WelcomeView extends View {

    title = new AuthTitle()
    input = new AuthInput()
    errorList = new InputTipList();
    inputHandler: () => void;
    private page: HubPage;

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("welcome-view")

        this.title.element.text("Твой позывной?")

        this.input.setPlaceholder("Например, \"Уничтожитель 3000\"")
        this.input.addButton("В атаку!")
        this.input.addTips()

        this.element.append(this.title.element, this.input.element)

        this.inputHandler = () => this.handleInput();
        this.input.input.on("input", this.inputHandler)
    }

    private handleInput() {
        let nick = this.input.element.val() as string
        let tips: Tip[] = checkNick(nick).map(reason => {
            return {
                text: textFromNickCheckResult(reason),
                style: TipStyle.ERROR
            }
        })
        this.errorList.setTips(tips)
    }
}