import './pause-select-row.scss'

import Cloud from "src/client/game/ui/cloud/cloud";
import View from "src/client/ui/view";

export default class PauseSelectRow extends View {
    description = new Cloud().blue()
    value = new Cloud().blue().button()

    constructor(text?: string) {
        super();
        this.element.addClass("pause-select-row")

        this.description.text(text)

        this.element.append(this.description.element)
        this.element.append(this.value.element)
    }

    setValue(text?: string) {
        this.value.text(text)
        return this
    }
}