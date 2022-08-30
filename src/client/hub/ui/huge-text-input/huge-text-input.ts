/* @load-resource: './huge-text-input.scss' */

import HugeInput from "../huge-input/huge-input";

export default class HugeTextInput extends HugeInput {

    input = $("<input>").addClass("huge-input huge-text-input")

    constructor() {
        super();
        this.element.append(this.input)
    }

    setPlaceholder(placeholder: string) {
        this.input.attr("placeholder", placeholder)
    }
}