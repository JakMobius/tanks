import EventEmitter from '../../utils/event-emitter';
import HistoryEntry from "./console-history-entry";
import CallbackLogger from "./callback-logger";
import ServerLine, {Keypress, Suggestion} from "../../library/serverline"

export default class ConsoleWindow extends EventEmitter {
    public destination: CallbackLogger;
    public history: HistoryEntry[];
    public historyIndex: number;
    public currentHistoryEntry: HistoryEntry;
    public prompt: string;
    public serverline: ServerLine

    constructor() {
        super()

        this.destination = new CallbackLogger((line) => this.write(line))

        this.history = []
        this.historyIndex = null

        this.currentHistoryEntry = new HistoryEntry(null, 0)

        this.serverline = new ServerLine()
        this.serverline.setPrompt('> ')

        this.serverline.on("keypress", (key: Keypress) => {
            if(key.name == "return") {
                this.onCommand(this.serverline.getLine())
            } else if(key.name == "tab") {
                this.onTab(key.shift)
            } else if(key.name == "up") {
                this.historyGoUp()
            } else if(key.name == "down") {
                this.historyGoDown()
            } else {
                this.onKeypress(key)
                return true
            }
            return false
        })

        this.serverline.on("after-keypress", () => {
            this.onInput()
        })

        this.serverline.on("exit", () => this.onExit())
    }

    getCurrentCursorPosition() {
        return this.serverline.getCursorPosition()
    }

    setCursorPosition(position: number) {
        this.serverline.setCursorPosition(position)
    }

    addHistoryEntry(command: string) {
        this.historyIndex = null

        if (this.history.length > 0) {
            const lastIndex = this.history.length - 1
            if (this.history[lastIndex].text === command) {
                this.history[lastIndex].cursorPos = this.getCurrentCursorPosition()
                return
            }
        }

        this.history.push(new HistoryEntry(command, this.getCurrentCursorPosition()))
    }

    historyGoUp() {
        if(this.historyIndex === null) {
            if(this.history.length > 0) {
                this.storeState(this.currentHistoryEntry)
                this.historyIndex = this.history.length - 1;
            } else {
                return
            }
        } else {
            this.historyIndex--;
        }

        if(this.historyIndex < 0) this.historyIndex = 0

        this.restoreState(this.history[this.historyIndex])

        this.onHistoryWalk()
    }

    storeState(entry: HistoryEntry) {
        entry.text = this.getValue()
        entry.cursorPos = this.getCurrentCursorPosition()
    }

    restoreState(entry: HistoryEntry) {
        this.setLine(entry.text)
        this.setCursorPosition(entry.cursorPos)
    }

    historyGoDown() {
        if (this.historyIndex === null) return

        this.historyIndex++

        if (this.historyIndex >= this.history.length) {
            this.historyIndex = null
            this.restoreState(this.currentHistoryEntry)
        } else {
            this.restoreState(this.history[this.historyIndex])
        }

        this.onHistoryWalk()
    }

    onHistoryWalk() {
        this.emit("history-walk")
    }

    write(text: string) {
        console.log(text)
    }

    setPrompt(prompt: string) {
        this.prompt = prompt + " >"
        this.serverline.setPrompt(this.prompt)
    }

    setLine(text: string) {
        this.serverline.setLine(text)
    }

    onCommand(text: string) {
        this.addHistoryEntry(text)
        this.emit("command", text)
        this.setLine("")
        this.setCursorPosition(0)
        this.onHistoryWalk()
    }

    onInput() {
        this.emit("input")
    }

    onKeypress(key: Keypress) {
        this.emit("keypress", key)
    }

    onExit() {
        this.emit("exit")
    }

    onTab(shift: boolean) {
        this.emit("tab", shift)
    }

    getValue(): string {
        return this.serverline.getLine()
    }

    suggest(param?: Suggestion[]) {
        this.serverline.suggest(param)
    }

    destroy() {
        this.serverline.close()
    }
}