
const EventEmitter = require("../../utils/eventemitter")
const LoggerDestination = require("../log/loggerdestination")
const blessed = require("./blessed-fork/lib/blessed")
const Color = require("/src/utils/color")
const Chalk = require("chalk")
const Textarea = require("./blessed-fork/lib/widgets/prompt")
const util = require("util")

class WindowDestination extends LoggerDestination {
    constructor(window) {
        super();
        this.window = window
    }

    log(value) {
        let text

        if(typeof value == "string") {
            text = this.convertChatColors(value)
        } else {
            text = util.inspect(value, {
                depth: 0,
                colors: true
            })
        }
        this.window.write(text)
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

class HistoryEntry {
    constructor(text, cursorPos) {
        this.text = text
        this.cursorPos = cursorPos
    }
}

class ConsoleWindow extends EventEmitter {
    constructor() {
        super()

        this.destination = new WindowDestination(this)
        this.waitsForRender = false
        this.history = []
        this.historyIndex = null

        this.currentHistoryEntry = new HistoryEntry(null, 0)
        this.lines = 0

        this.screen = new blessed.screen({
            smartCSR: true
        })

        this.screen.program.on("keypress", (key, data) => {
            if(data.name === "tab") {
                this.consoleTextbox.keyable = false
                this.emit("tab", data.shift)
            } else {
                this.consoleTextbox.keyable = true
                this.emit("keypress")
            }
        })

        this.scrollView = new blessed.scrollabletext({
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

        this.consoleTextbox = new blessed.prompt({
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            style: {
                fg: 'white',
                bg: 'black'
            },
            keys: true
        });

        this.promptLabel = new blessed.text({
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

        this.consoleTextbox.key(["C-c"], () => this.emit("exit"))

        this.consoleTextbox.key(["enter"], () => {
            const command = this.consoleTextbox.value
            this.addHistoryEntry(command)

            this.emit("command", command)
            this.consoleTextbox.setValue("")
            this.render()
        })

        this.consoleTextbox.key(["up"], () => this.historyGoUp())
        this.consoleTextbox.key(["down"], () => this.historyGoDown())

        this.screen.on("element blur", (a, b) => {
            if (a instanceof Textarea && (!b || !(b instanceof Textarea))) {
                setImmediate(() => this.refocus())
            }
        })

        this.refocus()
        this.render()
    }

    addHistoryEntry(command) {

        let pushHistoryEntry = true

        if (this.history.length > 0) {
            if (this.historyIndex === null) {
                const index = this.history.length - 1
                if (this.history[index].text === command) {
                    this.history[index].cursorPos = this.consoleTextbox.cursorPosition
                    pushHistoryEntry = false
                }
            }
        }

        if(pushHistoryEntry) {
            this.history.push(new HistoryEntry(command, this.consoleTextbox.cursorPosition))
        }

        this.historyIndex = null
    }

    historyGoUp() {
        if(this.historyIndex === null) {
            if(this.history.length > 0) {
                this.currentHistoryEntry.text = this.consoleTextbox.value
                this.currentHistoryEntry.cursorPos = this.consoleTextbox.cursorPosition
                this.historyIndex = this.history.length - 1;
            } else {
                return
            }
        } else {
            this.history[this.historyIndex].text = this.consoleTextbox.value
            this.history[this.historyIndex].cursorPos = this.consoleTextbox.cursorPosition
            this.historyIndex--;
        }

        if(this.historyIndex < 0) this.historyIndex = 0

        let cachedHistoryEntry = this.history[this.historyIndex]

        this.consoleTextbox.setValue(cachedHistoryEntry.text)
        this.consoleTextbox.setCursorPosition(cachedHistoryEntry.cursorPos)
        this.render()
    }

    historyGoDown() {
        if (this.historyIndex === null) return

        this.history[this.historyIndex].text = this.consoleTextbox.value
        this.history[this.historyIndex].cursorPos = this.consoleTextbox.cursorPosition

        this.historyIndex++

        if (this.historyIndex >= this.history.length) {
            this.historyIndex = null
            this.consoleTextbox.setValue(this.currentHistoryEntry.text)
            this.consoleTextbox.setCursorPosition(this.currentHistoryEntry.cursorPos)
            this.render()
        } else {
            let cachedHistoryEntry = this.history[this.historyIndex]

            this.consoleTextbox.setValue(cachedHistoryEntry.text)
            this.consoleTextbox.setCursorPosition(cachedHistoryEntry.cursorPos)
            this.render()
        }
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
        if (!this.screen.focused || !(this.screen.focused instanceof Textarea))
            this.consoleTextbox.focus()
    }

    setLine(text) {
        this.consoleTextbox.setValue(text)
        this.render()
    }
}

module.exports = ConsoleWindow