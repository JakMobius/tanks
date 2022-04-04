import BlessedConsoleWindow from "./blessed-console-window";

export default class HistoryEntry {
    public text: any;
    public cursorPos: any;

    constructor(text: string, cursorPos: number) {
        this.text = text
        this.cursorPos = cursorPos
    }

    storeState(console: BlessedConsoleWindow) {
        this.text = console.consoleBox.consoleTextbox.getValue()
        this.cursorPos = console.consoleBox.consoleTextbox.cursorPosition
    }

    restoreState(console: BlessedConsoleWindow) {
        console.setLine(this.text)
        console.setCursorPosition(this.cursorPos)
    }
}