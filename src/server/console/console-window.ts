
import EventEmitter from '../../utils/event-emitter';
import HistoryEntry from "./console-history-entry";
import CallbackLogger from "./callback-logger";
import ServerLine from "../../library/serverline"

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
        this.serverline.init()
        this.serverline.setPrompt('> ')

        this.serverline.on('line', (line: string) => {
            this.onCommand(line)
        });

        // this.consoleBox.consoleTextbox.key("C-c", () => this.onExit())
        // this.consoleBox.consoleTextbox.key("enter", () => {
        //     const command = this.getValue()
        //     this.onCommand(command)
        // })
        //
        // this.consoleBox.consoleTextbox.key("up", () => this.historyGoUp())
        // this.consoleBox.consoleTextbox.key("down", () => this.historyGoDown())
        // this.consoleBox.consoleTextbox.on("keypress", (_, event: blessed.KeyEvent) => {
        //     if(event.name == 'tab') {
        //         event.cancelled = true
        //         this.onTab(event.shift)
        //     }
        // })
        //
        // this.consoleBox.consoleTextbox.on("keypress", (_, event: blessed.KeyEvent) => {
        //     if(!event.cancelled) {
        //         this.onKeypress(event)
        //     }
        // }, EventEmitter.PRIORITY_LOW)
    }

    getCurrentCursorPosition() {
        return 0
    }

    setCursorPosition(position: number) {

    }

    addHistoryEntry(command: string) {

        let pushHistoryEntry = true

        if (this.history.length > 0) {
            if (this.historyIndex === null) {
                const index = this.history.length - 1
                if (this.history[index].text === command) {
                    this.history[index].cursorPos = this.getCurrentCursorPosition()
                    pushHistoryEntry = false
                }
            }
        }

        if(pushHistoryEntry) {
            this.history.push(new HistoryEntry(command, this.getCurrentCursorPosition()))
        }

        this.historyIndex = null
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
            this.storeState(this.history[this.historyIndex])
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

        this.storeState(this.history[this.historyIndex])

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
        this.prompt = prompt

        prompt += "> "
    }

    setLine(text: string) {

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

    onKeypress(key: any) {
        this.emit("keypress", key)
    }

    onExit() {
        this.emit("exit")
    }

    getValue(): string {
        return ""
    }

    suggest(param?: string, trim: boolean = true) {

    }

    destroy() {
        this.serverline.close()
    }
}