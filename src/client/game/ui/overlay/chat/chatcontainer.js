/* @load-resource: './chat.scss' */

const View = require("/src/client/ui/view")
const HTMLEscape = require("/src/utils/htmlescape")
const Color = require("/src/utils/color")

class ChatContainer extends View {
    constructor() {
        super();
        this.element.addClass("chat-container")
        this.chat = $("<div>").addClass("chat")
        this.input = $("<input>").addClass("chat-input").hide()
        this.input.on("keydown", (evt) => {
            if (evt.key === "Enter") {
                let value = this.input.val().trim()
                if(value.length) {
                    this.emit("chat", value)
                }
            } else if(evt.key !== "Escape") return

            this.hideInput()
            evt.stopPropagation()
        })

        this.element.append(this.chat)
        this.element.append(this.input)
    }

    showInput() {
        this.input.show()
        this.input.focus()
        this.emit("input-focus")
    }

    hideInput() {
        this.input.blur()
        this.input.hide()
        this.input.val("")
        this.emit("input-blur")
    }

    addMessage(text) {
        text = this.parseColor(HTMLEscape(text))

        this.chat.append($("<div>").html(text))
        let element = this.element.get(0)
        element.scrollTop = element.scrollHeight - element.clientHeight
    }

    parseColor(text) {

        // Some examples:
        // §F00; This text will be colored red
        // §0F0; This text will be colored green,§; but this text will be styled as default
        // §!00F; This text will become bold and blue,§!; and this is a bold text with default color

        return Color.replace(text, function(color, bold, text) {
            if(bold) {
                if(color)
                    return "<span style='font-weight:bold;color:#" + color + ";'>" + text + "</span>"

                return "<span style='font-weight:bold;'>" + text + "</span>"
            } else {
                if(color)
                    return "<span style='color:#" + color + ";'>" + text + "</span>"
                else
                    return text
            }
        })
    }

    clear() {
        this.chat.html("")
    }
}

module.exports = ChatContainer