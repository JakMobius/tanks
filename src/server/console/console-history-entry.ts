

export default class HistoryEntry {
    public text: string
    public cursorPos: number

    constructor(text: string, cursorPos: number) {
        this.text = text
        this.cursorPos = cursorPos
    }
}