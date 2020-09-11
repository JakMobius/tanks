
const EventEmitter = require("../../utils/eventemitter")
const LoggerDestination = require("../log/loggerdestination")
const blessed = require("blessed")
const Color = require("/src/utils/color")
const Chalk = require("chalk")

class WindowDestination extends LoggerDestination {
    constructor(window) {
        super();
        this.window = window
    }

    log(text) {
        this.window.write(this.convertChatColors(text))
    }

    convertChatColors(text) {
        return Color.replace(text, (color, bold, text) => {
            let chalk = bold ? Chalk.bold : Chalk
            if(color) {
                chalk = chalk.hex(color)
            }
            return chalk(text)
        })
    }
}

class ConsoleWindow extends EventEmitter {
    constructor() {
        super()

        this.destination = new WindowDestination(this)
        this.waitsForRender = false
        this.lines = 0

        this.screen = blessed.screen({
            smartCSR: true
        })

        this.screen.program.on("keypress", (key) => {
            if(key === "\t") {
                this.consoleTextbox.keyable = false
                this.emit("tab")
            } else {
                this.consoleTextbox.keyable = true
                this.emit("keypress")
            }
        })

        this.scrollView = blessed.ScrollableBox({
            top: 0,
            left: 0,
            right: 0,
            bottom: 1,

            scrollable: true,
            mouse: true,
            keys: true,
            style: {
                fg: 'white',
                bg: 'black'
            }
        })

        this.consoleTextbox = blessed.textbox({
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            style: {
                fg: 'white',
                bg: 'black'
            },
            keys: true,
            mouse: true,
            inputOnFocus: true
        });

        this.promptLabel = blessed.text({
            bottom: 0,
            left: 0,
            width: 10,
            height: 1,
            style: {
                fg: 'white',
                bg: 'black'
            }
        })

        this.screen.append(this.consoleTextbox);
        this.screen.append(this.scrollView);
        //this.screen.append(this.promptLabel)

        this.screen.key(["C-c"], () => {
            this.emit("exit")
        })
        this.consoleTextbox.key(["C-c"], () => {
            this.emit("exit")
        })
        this.consoleTextbox.key(["enter"], () => {
            this.emit("command", this.consoleTextbox.value)
            this.consoleTextbox.setValue("")
            this.refocus()
            this.render()
        })

        this.screen.on("element blur", (a, b) => {

            if (a.constructor.name === "Textbox" && (!b || b.constructor.name !== "Textbox")) {
                setImmediate(() => this.refocus())
            }
        })

        this.render()
    }

    write(text) {
        text = text.split("\n")
        this.scrollView.insertLine(this.lines, text);
        this.scrollView.setScrollPerc(100)
        this.lines += text.length
        this.render();
    }

    setPrompt(prompt) {
        this.prompt = prompt

        prompt += "> "
        this.promptLabel.content = prompt
        this.promptLabel.width = prompt.length
        this.consoleTextbox.left = prompt.length
    }

    render() {
        if(this.waitsForRender) return
        this.waitsForRender = true

        setImmediate(() => {
            this.screen.render();
            this.waitsForRender = false
        })
    }

    refocus() {
        if (!this.screen.focused || this.screen.focused.constructor.name !== "Textbox")
            this.consoleTextbox.focus()
    }

    setLine(text) {
        this.consoleTextbox.setValue(text)
        this.render()
    }
}

module.exports = ConsoleWindow