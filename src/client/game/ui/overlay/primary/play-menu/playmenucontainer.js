/* @load-resource: './play-menu.scss' */

const Menu = require("/src/client/ui/menu/menu")

class PlayMenuContainer extends Menu {
    constructor() {
        super();

        this.element.addClass("nick")
        this.titleLabel = $("<div>").css("text-align", "center").addClass("header")
        this.titleLabel.text("ВВЕДИТЕ НИК")
        this.nickInput = $("<input>")
        this.playButton = $("<button></button>").text("ИГРАТЬ")

        this.element.append(this.titleLabel)
        this.element.append(this.nickInput)
        this.element.append(this.playButton)

        let handler = () => {
            if(this.nickInput.val().length === 0) {
                this.playButton.prop("disabled", true)
            } else if(this.nickInput.val().length > 10) {
                this.playButton.prop("disabled", true)
            } else this.playButton.prop("disabled", false)
        }

        this.nickInput.on("input", handler)
        this.nickInput.on("change", handler)
        this.nickInput.on("paste", handler)
        this.nickInput.val(localStorage.getItem("tanks-nick") || "")

        this.playButton.on("click", () => {
            if(this.playButton.is("[disabled]")) return

            let nick = this.nickInput.val()
            localStorage.setItem("tanks-nick", nick)
            this.emit("play")
        })

        handler()
    }
}

module.exports = PlayMenuContainer