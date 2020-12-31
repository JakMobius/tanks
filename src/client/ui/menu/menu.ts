/* @load-resource: "./menu.scss" */

import View from '../view';

class Menu extends View {
    constructor() {
        super()
        this.element.addClass("menu")
    }
}

export default Menu;