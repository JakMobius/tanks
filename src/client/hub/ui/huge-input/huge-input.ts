/* @load-resource: './huge-input.scss' */

import View from "src/client/ui/view";
import InputTipList from "../input-tip-list/input-tip-list-view";

export default class HugeInput extends View {

    tips: InputTipList = null
    button: JQuery;

    constructor() {
        super();
        this.element.addClass("huge-input-container")
    }

    addTips() {
        this.tips = new InputTipList()
        this.element.append(this.tips.element)
    }

    addButton(text: string) {
        this.button = $("<button>").addClass("huge-input-button").text(text)
        this.element.append(this.button)
        this.element.addClass("with-button")
    }
}