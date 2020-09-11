/* @load-resource: './overlay.scss' */

const EventEmitter = require("../../utils/eventemitter")

class Overlay extends EventEmitter {
    constructor(options) {
        super()
        this.overlay = $("<div>").addClass("overlay")
        this.shown = false
        this.root = options.root
        this.root.append(this.overlay)
        this.overlay.hide()
    }

    show() {
        if(this.shown) { return }

        this.shown = true
        this.overlay.show()
        this.overlay.fadeIn()
        this.overlay[0].focus()
    }

    hide(callback) {
        if(!this.shown) { return }

        this.shown = false
        this.overlay.fadeOut(700, callback)
        this.overlay[0].blur()
    }
}

module.exports = Overlay