
const Overlay = require("/src/client/ui/overlay/overlay")
const BlockSelectMenu = require("./blockselectmenu")

class BlockSelectOverlay extends Overlay {
    constructor(options) {
        super(options);

        this.menu = new BlockSelectMenu()
        this.overlay.append(this.menu.element)

        this.overlay.attr("tabindex", 1)
        this.overlay.keydown((event) => {
            if(event.key === "Escape") {
                this.hide()
            }
        })

        this.overlay.on("click", (event) => {
            if(event.target === this.overlay[0]) {
                this.hide()
            }
        })

        this.menu.on("select", (name, block) => {
            this.emit("select", name, block)
            this.hide()
        })
    }
}

module.exports = BlockSelectOverlay