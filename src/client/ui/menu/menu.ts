import "./menu.scss"

import View from '../view';

export default class Menu extends View {
    constructor() {
        super()
        this.element.addClass("menu")
    }
}