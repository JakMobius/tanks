
import EventEmitter from '../../utils/eventemitter';
import LoggerDestination from '../log/logger-destination';
import blessed from './blessed-fork/lib/blessed';
import Textarea from './blessed-fork/lib/widgets/prompt';

class WindowDestination extends LoggerDestination {
	public window: any;

    constructor(window) {
        super();
        this.window = window
    }

    log(value) {
        this.window.write(value)
    }
}

class HistoryEntry {
	public text: any;
	public cursorPos: any;

    constructor(text, cursorPos) {
        this.text = text
        this.cursorPos = cursorPos
    }

    storeState(console) {
        this.text = console.consoleTextbox.value
        this.cursorPos = console.consoleTextbox.cursorPosition
    }

    restoreState(console) {
        console.consoleTextbox.setValue(this.text)
        console.consoleTextbox.setCursorPosition(this.cursorPos)
    }
}

class ConsoleWindow extends EventEmitter {
	public destination: any;
	public waitsForRender: any;
	public history: any;
	public historyIndex: any;
	public currentHistoryEntry: any;
	public lines: any;
	public screen: any;
	public consoleTextbox: any;
	public scrollView: any;
	public promptLabel: any;
	public prompt: any;

    constructor() {
        super()

        this.destination = new WindowDestination(this)
        this.waitsForRender = false
        this.history = []
        this.historyIndex = null

        this.currentHistoryEntry = new HistoryEntry(null, 0)
        this.lines = 0

        this.screen = new blessed.Screen({
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

        this.scrollView = new blessed.ScrollableText({
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

        this.consoleTextbox = new blessed.Prompt({
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

        this.promptLabel = new blessed.Text({
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
                this.currentHistoryEntry.storeState(this)
                this.historyIndex = this.history.length - 1;
            } else {
                return
            }
        } else {
            this.history[this.historyIndex].storeState(this)
            this.historyIndex--;
        }

        if(this.historyIndex < 0) this.historyIndex = 0

        this.history[this.historyIndex].restoreState(this)
        this.render()
    }

    historyGoDown() {
        if (this.historyIndex === null) return

        this.history[this.historyIndex].storeState(this)

        this.historyIndex++

        if (this.historyIndex >= this.history.length) {
            this.historyIndex = null
            this.currentHistoryEntry.restoreState(this)
        } else {
            this.history[this.historyIndex].restoreState(this)
        }

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
        if (!this.screen.focused || !(this.screen.focused instanceof Textarea))
            this.consoleTextbox.focus()
    }

    setLine(text) {
        this.consoleTextbox.setValue(text)
        this.render()
    }
}

export default ConsoleWindow;