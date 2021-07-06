/* @load-resource: './auth-title.scss' */

import View from "../../../ui/view";

export default class AuthTitle extends View {
    constructor() {
        super();

        this.element.addClass("auth-title")
    }
}