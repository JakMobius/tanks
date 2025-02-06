import './huge-title.scss'

import View from "src/client/ui/view";

export default class HugeTitle extends View {
    constructor() {
        super();

        this.element.addClass("huge-title")
    }
}