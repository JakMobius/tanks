/* @load-resource: './huge-title.scss' */

import View from "../../../ui/view";

export default class HugeTitle extends View {
    constructor() {
        super();

        this.element.addClass("huge-title")
    }
}