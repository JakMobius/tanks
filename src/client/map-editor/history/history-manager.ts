
export interface Modification {
    actionName: string
    perform: () => void
    revert: () => void
}

export default class HistoryManager {
    preventNativeModificationRegistering: boolean = false

	public history: Modification[];
	public historyIndex: number;

    constructor() {
        this.history = []
        this.historyIndex = -1
    }

    clear() {
        this.history = []
        this.historyIndex = -1
    }

    registerModification(modification: Modification) {
        if(this.historyIndex < this.history.length - 1)
            this.history = this.history.slice(0, this.historyIndex + 1)

        this.history.push(modification)
        this.historyIndex++
    }

    goBack() {
        let index = this.historyIndex
        if(index < 0) {
            this.historyIndex = -1
            return null
        }
        this.historyIndex--
        this.history[index]?.revert()
        return this.history[index]
    }

    goForward() {
        if(this.historyIndex >= this.history.length - 1) return null;
        this.historyIndex++
        this.history[this.historyIndex]?.perform()
        return this.history[this.historyIndex]
    }
}