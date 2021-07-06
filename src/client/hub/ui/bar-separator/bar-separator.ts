/* @load-resource: './bar-separator.scss' */

import View from "../../../ui/view";

export default class BarSeparator extends View {
    constructor() {
        super();
        this.element.addClass("bar-separator")
    }
}