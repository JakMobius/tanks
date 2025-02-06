import './welcome.scss'

import View from "src/client/ui/view";
import InputTipList, {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import {checkNick} from "src/data-checkers/nick-checker";
import {textFromNickCheckResult} from "src/client/hub/localizations";
import HugeTextInput from "../huge-text-input/huge-text-input";
import HugeTitle from "../huge-title/huge-title";
import {HubPage} from "../hub-page";

export default class WelcomeView extends View {

    input = new HugeTextInput()
    errorList = new InputTipList();
    private page: HubPage;

    constructor(page: HubPage) {
        super();

        this.page = page
        this.element.addClass("welcome-view")

        let title = new HugeTitle()
        title.element.text("Твой позывной?")

        this.input.setPlaceholder("Например, \"Уничтожитель 3000\"")
        this.input.addButton("В атаку!")
        this.input.addTips()

        this.element.append(title.element, this.input.element)

        this.input.input.on("input", () => this.handleInput())
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