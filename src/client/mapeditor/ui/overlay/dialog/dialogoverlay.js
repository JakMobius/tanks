
const Overlay = require("../../../../ui/overlay")
const DialogView = require("./dialogview")

class DialogOverlay extends Overlay {
    constructor(options) {
        super(options)

        this.dialog = new DialogView()
        this.overlay.append(this.dialog.element)
        this.requiresDecision = false
        this.dialog.on("decision", () => this.hide())
    }

    show() {
        this.overlay.attr("tabindex", 1)
        this.overlay.focus()

        if(!this.requiresDecision) {
            this.overlay.click((event) => {
                if(event.target === this.overlay) {
                    this.hide()
                }
            })
            this.overlay.on("keydown", (event) => {
                if(event.code === "Escape") {
                    this.hide()
                }
            })
        }

        super.show()
    }

    hide(callback) {
        this.overlay.blur()
        super.hide(() => {
            this.overlay.remove()
            callback && callback()
        })
    }
}

module.exports = DialogOverlay