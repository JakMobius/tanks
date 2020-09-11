
const View = require("../../../../ui/view")

class DialogView extends View {
    constructor() {
        super();

        this.element.addClass("menu dialog")
        this.header = $("<div>").addClass("title")
        this.message = $("<div>").addClass("message")
        this.footer = $("<div>").addClass("footer")
        this.element.append(this.header)
        this.element.append(this.message)
        this.element.append(this.footer)
    }

    title(text) {
        this.header.text(text)
    }

    text(text) {
        this.message.text(text)
    }

    addButton(config) {
        let button = $("<button>")
        button.text(config.title)
        if(config.color) button.css("background-color", config.color)
        if(config.side === "left") {
            button.css("position", "absolute")
            button.css("left", "6px")
        }
        if(config.width) {
            button.css("width", config.width)
        }
        if(config.onclick) {
            button.click(() => {
                config.onclick()
                if(config.closes) this.emit("decision")
            })
        } else if(config.closes) {
            button.click(() => this.emit("decision"))
        }

        this.footer.append(button)
        return button
    }
}

module.exports = DialogView