import './pause-key-value-row.scss'

import View from "src/client/ui/view";

export default class PauseKeyValueRow extends View {
    constructor() {
        super()
        this.element.addClass("pause-key-value-row")
    }

    small() {
        this.element.addClass("small")
        return this
    }
}