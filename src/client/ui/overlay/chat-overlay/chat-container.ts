import './chat-container.scss'

import View from 'src/client/ui/view';
import HTMLEscape from 'src/utils/html-escape';
import Color from 'src/utils/color';

export default class ChatContainer extends View {
	public chat: JQuery;
	public input: JQuery;

    constructor() {
        super();
        this.element.addClass("chat-container")
        this.chat = $("<div>").addClass("chat")

        let inputContainer = $("<div>").addClass("input-container")

        this.input = $("<input>")
            .addClass("chat-input")
            .attr("placeholder", "Ваше сообщение")
            .hide()
        this.input.on("keydown", (evt: JQuery.Event) => {
            if (evt.key === "Enter") {
                let value = String(this.input.val()).trim()
                if(value.length) {
                    this.emit("chat", value)
                }
            } else if(evt.key !== "Escape") return

            this.input.trigger("blur")
            evt.stopPropagation()
        })

        this.input.on("blur", () => {
            this.input.hide()
            this.input.val("")
            this.emit("input-blur")
        })

        inputContainer.append(this.input)

        this.element.append(this.chat)
        this.element.append(inputContainer)
    }

    showInput() {
        this.input.show()
        this.input.trigger("focus")
        this.emit("input-focus")
    }

    hideInput() {

    }

    addMessage(text: string) {
        text = this.parseColor(HTMLEscape(text))

        this.chat.append($("<div>").addClass("message").html(text))
        let element = this.chat.get(0)
        element.scrollTop = element.scrollHeight - element.clientHeight
    }

    parseColor(text: string) {

        // Some examples:
        // §F00; This text will be colored red
        // §0F0; This text will be colored green,§; but this text will be styled as default
        // §!00F; This text will become bold and blue,§!; and this is a bold text with default color

        return Color.replace(text, function(color: string, bold: boolean, text: string) {
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