/* @load-resource: "./menu.scss" */

const View = require("../view")

class Menu extends View {
    constructor() {
        super()
        this.element.addClass("menu")
    }
}

module.exports = Menu