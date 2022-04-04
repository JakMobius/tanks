

export default class HistoryEntry {
    public text: any;
    public cursorPos: any;

    constructor(text: string, cursorPos: number) {
        this.text = text
        this.cursorPos = cursorPos
    }
}