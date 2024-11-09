/* @load-resource: "./input-cloud.scss" */

import Cloud from "src/client/ui/overlay/pause-overlay/elements/cloud/cloud";
import AutoresizeInput from "src/client/ui/elements/autoresize-input/autoresize-input";

export default class InputCloud extends Cloud {
    input = new AutoresizeInput()
    prefix = $("<span>")
    suffix = $("<span>")

    constructor() {
        super()
        this.customClass("input-cloud")
        this.element.append(this.prefix, this.input.element, this.suffix)
    }

    setPrefix(prefix: string) {
        this.prefix[0].textContent = prefix
        return this
    }

    setSuffix(suffix: string) {
        this.suffix[0].textContent = suffix
        return this
    }

    setPlaceholder(placeholder: string) {
        this.input.setPlaceholder(placeholder)
        return this
    }

    getPlaceholder() {
        return this.input.getPlaceholder()
    }

    setValue(value: string) {
        this.input.setValue(value)
        return this
    }

    getValue() {
        return this.input.getValue()
    }
}