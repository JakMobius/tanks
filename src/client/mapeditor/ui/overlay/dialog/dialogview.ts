
import Menu from '../../../../ui/menu/menu';

export interface DialogButtonConfig {
    title: string
    color?: string
    side?: "left"
    width?: string
    onclick?: () => void
    closes?: boolean
}

class DialogView extends Menu {
	public header: any;
	public message: any;
	public footer: any;

    constructor() {
        super();

        this.element.addClass("dialog")
        this.header = $("<div>").addClass("title")
        this.message = $("<div>").addClass("message")
        this.footer = $("<div>").addClass("footer")
        this.element.append(this.header)
        this.element.append(this.message)
        this.element.append(this.footer)
    }

    title(text: string) {
        this.header.text(text)
    }

    text(text: string) {
        this.message.text(text)
    }

    addButton(config: DialogButtonConfig) {
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
            button.on("click", () => {
                config.onclick()
                if(config.closes) this.emit("decision")
            })
        } else if(config.closes) {
            button.on("click",() => this.emit("decision"))
        }

        this.footer.append(button)
        return button
    }
}

export default DialogView;