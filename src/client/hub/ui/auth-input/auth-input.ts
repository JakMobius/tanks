/* @load-resource: './auth-input.scss' */

import View from "../../../ui/view";
import InputTipList from "../input-tip-list/input-tip-list-view";

export default class AuthInput extends View {

    input = $("<input>").addClass("auth-input")
    tips: InputTipList = null
    button: JQuery;

    constructor() {
        super();
        this.element.addClass("auth-container")
        this.element.append(this.input)
    }

    addTips() {
        this.tips = new InputTipList()
        this.element.append(this.tips.element)
    }

    addButton(text: string) {
        this.button = $("<button>").addClass("auth-button").text(text)
        this.element.append(this.button)
        this.element.addClass("with-button")
    }

    setPlaceholder(placeholder: string) {
        this.input.attr("placeholder", placeholder)
    }
}