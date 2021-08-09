
import EventEmitter from '../../utils/eventemitter';
import * as blessed from '../../library/blessed-fork/lib/blessed';
import ConsoleBox from "./console-box";
import HistoryEntry from "./console-history-entry";
import ConsoleLogger from "./console-logger";
import StdinCatchLogger from "../log/std-catch-logger";

export default class ConsoleWindow extends EventEmitter {
	public destination: ConsoleLogger;
	public history: HistoryEntry[];
	public historyIndex: number;
	public currentHistoryEntry: HistoryEntry;
	public lines: number;
	public screen: blessed.Screen;
	public prompt: string;
	public consoleBox: ConsoleBox
    private stdLogger: StdinCatchLogger;

    constructor() {
        super()

        this.destination = new ConsoleLogger(this)
        this.stdLogger = new StdinCatchLogger()
        this.stdLogger.addDestination(this.destination)
        this.stdLogger.catchStd()
        this.history = []
        this.historyIndex = null

        this.currentHistoryEntry = new HistoryEntry(null, 0)
        this.lines = 0

        this.screen = new blessed.Screen({
            smartCSR: true,
            cursor: {
                //artificial: true,
                blink: true,
                shape: "line"
            },
            fullUnicode: true
        })

        this.consoleBox = new ConsoleBox({})
        this.screen.append(this.consoleBox)

        this.screen.program.on("preflush", () => this.stdLogger.releaseStd())
        this.screen.program.on("flush", () => this.stdLogger.catchStd())

        this.consoleBox.consoleTextbox.key("C-c", () => this.onExit())
        this.consoleBox.consoleTextbox.key("enter", () => {
            const command = this.getValue()
            this.onCommand(command)
        })

        this.consoleBox.consoleTextbox.key("up", () => this.historyGoUp())
        this.consoleBox.consoleTextbox.key("down", () => this.historyGoDown())
        this.consoleBox.consoleTextbox.on("keypress", (_, event: blessed.KeyEvent) => {
            if(event.name == 'tab') {
                event.cancelled = true
                this.onTab(event.shift)
            }
        })

        this.consoleBox.consoleTextbox.on("keypress", (_, event: blessed.KeyEvent) => {
            if(!event.cancelled) {
                this.onKeypress(event)
            }
        }, EventEmitter.PRIORITY_LOW)

        this.refocus()
        this.consoleBox.setNeedsRender()
        this.stdLogger.catchStd()
    }

    addHistoryEntry(command: string) {

        let pushHistoryEntry = true

        if (this.history.length > 0) {
            if (this.historyIndex === null) {
                const index = this.history.length - 1
                if (this.history[index].text === command) {
                    this.history[index].cursorPos = this.consoleBox.consoleTextbox.cursorPosition
                    pushHistoryEntry = false
                }
            }
        }

        if(pushHistoryEntry) {
            this.history.push(new HistoryEntry(command, this.consoleBox.consoleTextbox.cursorPosition))
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

        this.onHistoryWalk()
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

        this.onHistoryWalk()
    }

    onHistoryWalk() {
	    this.emit("history-walk")
    }

    write(text: string) {
        let lines = text.split("\n")
        this.consoleBox.scrollView.insertLine(this.lines, lines);
        this.consoleBox.scrollView.setScrollPerc(100)
        this.lines += lines.length
    }

    setPrompt(prompt: string) {
        this.prompt = prompt

        prompt += "> "
        this.consoleBox.promptLabel.content = prompt
        this.consoleBox.promptLabel.position.width = prompt.length
        this.consoleBox.consoleTextbox.position.x = prompt.length
        this.consoleBox.promptLabel.onResize()
    }

    refocus() {
        if(!this.consoleBox.consoleTextbox.isFocused())
            this.consoleBox.consoleTextbox.focus()
    }

    setLine(text: string) {
        this.consoleBox.consoleTextbox.setValue(text)
    }

    setCursorPosition(position: number) {
        this.consoleBox.consoleTextbox.setCursorPosition(position)
    }

    onCommand(text: string) {
        this.addHistoryEntry(text)
        this.emit("command", text)
        this.setLine("")
        this.onHistoryWalk()
    }

    onTab(shift: boolean) {
        this.emit("tab", shift)
    }

    onKeypress(key: blessed.KeyEvent) {
	    this.emit("keypress", key)
    }

    onExit() {
        this.stdLogger.releaseStd()
        this.emit("exit")
        this.screen.destroy()
        // TODO: remove this
        process.exit(0)
    }

    getValue() {
	    return this.consoleBox.consoleTextbox.getValue()
    }

    suggest(param?: string, trim: boolean = true) {
        if(param) {
            if(trim) param = param.substr(this.consoleBox.consoleTextbox.getValue().length)
            this.consoleBox.suggestionLabel.position.width = param.length
            this.consoleBox.suggestionLabel.setContent(param)
            this.consoleBox.suggestionLabel.hidden = false

            this.consoleBox.onResize()
            this.consoleBox.setNeedsRender()
        } else {
            this.consoleBox.suggestionLabel.position.width = 0
            this.consoleBox.suggestionLabel.hidden = true

            this.consoleBox.onResize()
            this.consoleBox.setNeedsRender()
        }
    }

    destroy() {
        this.screen.destroy()
        this.stdLogger.releaseStd()
    }
}