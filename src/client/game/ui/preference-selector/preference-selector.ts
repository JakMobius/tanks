/* @load-resource: ./preference-selector.scss */

import View from "../../../ui/view";
import Cloud from "../cloud/cloud";

export default class PreferenceSelector extends View {
    description = new Cloud().blue()
    value = new Cloud().blue().button()

    constructor(text?: string) {
        super();
        this.element.addClass("preference-selector")

        this.description.text(text)

        this.element.append(this.description.element)
        this.element.append(this.value.element)
    }

    setValue(text?: string) {
        this.value.text(text)
        return this
    }
}